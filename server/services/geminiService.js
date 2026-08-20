import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeWebsite } from '../utils/normalize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'email-templates');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

let assetsCache = null;

async function loadAssets() {
  if (assetsCache) return assetsCache;
  const [websitePrompt, websiteTemplate, noWebsitePrompt, noWebsiteTemplate] = await Promise.all([
    fs.readFile(path.join(TEMPLATES_DIR, 'website-exists-system-prompt.txt'), 'utf8'),
    fs.readFile(path.join(TEMPLATES_DIR, 'website-exists-email-template.txt'), 'utf8'),
    fs.readFile(path.join(TEMPLATES_DIR, 'no-website-system-prompt.txt'), 'utf8'),
    fs.readFile(path.join(TEMPLATES_DIR, 'no-website-email-template.txt'), 'utf8'),
  ]);
  assetsCache = {
    websitePrompt,
    websiteTemplate,
    noWebsitePrompt,
    noWebsiteTemplate,
  };
  return assetsCache;
}

function buildLeadContext(lead) {
  const sourceData = lead.sourceData || {};
  const location = [lead.city, lead.country].filter(Boolean).join(', ') || sourceData.address || 'your area';

  return {
    businessName: lead.businessName || lead.name || sourceData.title || sourceData.business_name || '',
    name: lead.name || lead.businessName || '',
    category: lead.category || sourceData.category || 'business',
    phone: lead.phone || sourceData.phone || '',
    email: lead.email || '',
    website: normalizeWebsite(lead.website || sourceData.website || ''),
    hasWebsite: Boolean(lead.website || sourceData.website || lead.hasWebsite),
    address: lead.address || sourceData.address || '',
    city: lead.city || sourceData.complete_address?.city || sourceData.location?.city || '',
    country: lead.country || sourceData.complete_address?.country || sourceData.location?.country || '',
    location,
    timezone: lead.timezone || sourceData.timezone || '',
    source: lead.source || sourceData.source || '',
    description: sourceData.description || '',
    rating: sourceData.rating || '',
    reviewCount: sourceData.review_count || sourceData.reviews || '',
    priceRange: sourceData.price_range || '',
    languages: sourceData.languages || [],
    serviceAreas: sourceData.service_areas || [],
    hours: sourceData.hours || {},
    completeAddress: sourceData.complete_address || sourceData.location || {},
    contact: sourceData.contact || {},
    engagement: sourceData.engagement || {},
  };
}

function buildUserContent(lead, analysis, hasWebsite) {
  const leadContext = buildLeadContext(lead);
  const parts = [`LEAD DATA:\n${JSON.stringify(leadContext, null, 2)}`];

  if (hasWebsite && analysis?.response) {
    parts.push(`\nWEBSITE ANALYSIS DATA:\n${JSON.stringify(analysis.response, null, 2)}`);
  }

  return parts.join('\n');
}

function tryParseJSON(text) {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

function normalizePlaceholderKey(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cleanPhrase(value, stripTrailingPunctuation = false) {
  if (value === undefined || value === null) return '';
  let v = String(value).trim();
  if (stripTrailingPunctuation) {
    v = v.replace(/[.,;:!?]+$/, '');
  }
  return v;
}

function buildPlaceholders(lead, geminiResponse, hasWebsite) {
  const ctx = buildLeadContext(lead);
  const p = geminiResponse?.personalization || {};
  const o = geminiResponse?.outreach_angle || {};

  const senderName = process.env.SENDER_NAME || 'Your Name';
  const senderRole = process.env.SENDER_ROLE || 'Web Consultant / WEBYTIC';
  const portfolioLink = process.env.PORTFOLIO_LINK || '';
  const linkedinLink = process.env.LINKEDIN_LINK || '';
  const fiverrLink = process.env.FIVERR_LINK || '';
  const whatsappNumber = process.env.WHATSAPP_NUMBER || '';
  const relevantDemoLink =
    geminiResponse?.relevant_demo_link ||
    geminiResponse?.relevant_demo_reason ||
    process.env.RELEVANT_DEMO_LINK ||
    'a recent portfolio piece';

  const fallbackAcknowledgement = ctx.hasWebsite
    ? `I took a look at ${ctx.businessName || 'your business'}'s website and it looks like a solid foundation.`
    : `I came across ${ctx.businessName || 'your business'} and it looks like a well-established ${ctx.category}.`;

  const map = {
    client_name: ctx.businessName || 'there',
    business_name: ctx.businessName || 'your business',
    name: ctx.name || ctx.businessName || 'there',
    category: ctx.category || 'business',
    location: ctx.location || 'your area',
    address: ctx.address || '',
    city: ctx.city || '',
    country: ctx.country || '',
    phone: ctx.phone || '',
    email: ctx.email || '',
    website: ctx.website || '',

    business_acknowledgement: p.business_acknowledgement || p.existing_strength || fallbackAcknowledgement,
    specific_observation: cleanPhrase(p.specific_observation || o.primary_angle || '', true),
    business_impact: cleanPhrase(p.business_impact || o.supporting_angle || '', false),
    recommended_improvement: cleanPhrase(p.recommended_improvement || '', false),

    existing_strength: cleanPhrase(p.existing_strength || p.business_acknowledgement || '', true),
    online_opportunity: cleanPhrase(p.online_opportunity || '', false),
    business_benefit: cleanPhrase(p.business_benefit || p.online_opportunity || '', false),

    primary_angle: o.primary_angle || '',
    supporting_angle: o.supporting_angle || '',
    opportunity_fomo: o.opportunity_fomo || '',
    positive_signal: geminiResponse?.positive_signal || '',
    relevant_demo_reason: geminiResponse?.relevant_demo_reason || '',
    relevant_demo_link: relevantDemoLink,
    confidence: geminiResponse?.confidence || '',

    your_name: senderName,
    'role_/_webytic': senderRole,
    role_webytic: senderRole,
    role: senderRole,
    portfolio_link: portfolioLink,
    linkedin_link: linkedinLink,
    fiverr_link: fiverrLink,
    whatsapp_number: whatsappNumber,
  };

  return map;
}

function fillTemplate(template, placeholders) {
  return template.replace(/\{\{([\s\S]*?)\}\}/g, (_, key) => {
    const normalized = normalizePlaceholderKey(key);
    const value = placeholders[normalized];
    if (value === undefined || value === null) return '';
    return String(value);
  });
}

function buildSubject(placeholders, hasWebsite) {
  const subjectTemplate = process.env.EMAIL_SUBJECT_TEMPLATE || (hasWebsite
    ? 'A quick observation about {{BUSINESS_NAME}}'
    : 'Quick idea for {{BUSINESS_NAME}}');
  return fillTemplate(subjectTemplate, placeholders);
}

async function callGemini(systemPrompt, userContent) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userContent }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.6,
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateEmail(lead, analysis = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const { websitePrompt, websiteTemplate, noWebsitePrompt, noWebsiteTemplate } = await loadAssets();
  const hasWebsite = Boolean(lead.website || lead.hasWebsite || lead.sourceData?.website);

  const systemPrompt = hasWebsite ? websitePrompt : noWebsitePrompt;
  const template = hasWebsite ? websiteTemplate : noWebsiteTemplate;
  const userContent = buildUserContent(lead, analysis, hasWebsite);

  let rawText;
  try {
    rawText = await callGemini(systemPrompt, userContent);
  } catch (err) {
    throw new Error(`Gemini unavailable: ${err.message}`);
  }

  const geminiResponse = tryParseJSON(rawText) || {};
  const placeholders = buildPlaceholders(lead, geminiResponse, hasWebsite);
  const body = fillTemplate(template, placeholders);
  const subject = buildSubject(placeholders, hasWebsite);

  return { subject, body, data: geminiResponse };
}