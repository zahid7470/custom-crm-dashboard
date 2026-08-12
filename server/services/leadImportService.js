import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Lead from '../models/Lead.js';
import { normalizePhone, normalizeEmail, normalizeWebsite, hasWebsite, stringHash } from '../utils/normalize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEAD_DIR = path.resolve(__dirname, '..', '..', 'lead');

function getExternalId(raw) {
  if (raw.source === 'map') return raw.place_id || raw.input_id;
  if (raw.source === 'facebook') return raw.profile_id;
  return null;
}

function extractCountryCityAddress(raw) {
  if (raw.source === 'map') {
    const addr = raw.complete_address || {};
    const country = addr.country || '';
    const city = addr.city || addr.borough || '';
    const address = raw.address || '';
    return { country, city, address };
  }

  if (raw.source === 'facebook') {
    const loc = raw.location || {};
    return {
      country: loc.country || (raw.service_areas && raw.service_areas[0]) || '',
      city: loc.city || '',
      address: raw.address || loc.street || '',
    };
  }
  return { country: '', city: '', address: '' };
}

function extractLead(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const source = raw.source;
  if (!['map', 'facebook'].includes(source)) return null;

  const externalId = getExternalId(raw);
  if (!externalId) return null;

  const { country, city, address } = extractCountryCityAddress(raw);

  let businessName = '';
  let phone = '';
  let email = '';
  let website = '';
  let category = '';

  if (source === 'map') {
    businessName = raw.title || '';
    category = raw.category || '';
    phone = normalizePhone(raw.phone);
    const emails = raw.emails;
    email = normalizeEmail(Array.isArray(emails) ? emails[0] : emails);
    website = normalizeWebsite(raw.website);
  } else if (source === 'facebook') {
    businessName = raw.business_name || '';
    category = raw.category || '';
    const contact = raw.contact || {};
    phone = normalizePhone(contact.phones);
    email = normalizeEmail(contact.emails);
    website = normalizeWebsite(contact.website);
  }

  const finalExternalId = externalId || stringHash(`${source}:${businessName}:${phone}:${website}:${address}:${city}:${country}`);

  return {
    source,
    externalId: finalExternalId,
    sourceData: raw,
    businessName,
    name: businessName,
    category,
    phone,
    email,
    website,
    hasWebsite: hasWebsite(website),
    country,
    city,
    address,
    timezone: raw.timezone || '',
  };
}

export async function importLeads() {
  const summary = { total: 0, imported: 0, duplicates: 0, invalid: 0 };
  let files = [];

  try {
    files = (await fs.readdir(LEAD_DIR)).filter((f) => f.endsWith('.json'));
  } catch (err) {
    throw new Error(`Unable to read lead directory: ${err.message}`);
  }

  if (files.length === 0) {
    return summary;
  }

  for (const file of files) {
    const filePath = path.join(LEAD_DIR, file);
    let data;
    try {
      const content = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(content);
    } catch (err) {
      summary.invalid += 1;
      continue;
    }

    const records = Array.isArray(data) ? data : data.results ? data.results : [data];

    for (const raw of records) {
      summary.total += 1;
      const leadData = extractLead(raw);
      if (!leadData) {
        summary.invalid += 1;
        continue;
      }

      const existing = await Lead.findOne({ source: leadData.source, externalId: leadData.externalId });
      if (existing) {
        summary.duplicates += 1;
        continue;
      }

      await Lead.create(leadData);
      summary.imported += 1;
    }
  }

  return summary;
}
