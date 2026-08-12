import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { importLeads } from '../services/leadImportService.js';
import { analyzeWebsite, getAnalysisByLead } from '../services/websiteAnalysisService.js';
import { generateEmail } from '../services/geminiService.js';
import { normalizeWebsite } from '../utils/normalize.js';
import { asyncHandler, success } from '../utils/response.js';

const statusDates = {
  contacted: 'contactedAt',
  responded: 'respondedAt',
  closed_client: 'closedAt',
};

export const importLeadsHandler = asyncHandler(async (req, res) => {
  const summary = await importLeads();
  success(res, 'Leads imported successfully', summary);
});

export const getLeads = asyncHandler(async (req, res) => {
  const { source, status, hasWebsite, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const query = {};
  if (source) query.source = source;
  if (status) query.status = status;
  if (hasWebsite !== undefined) query.hasWebsite = hasWebsite === 'true' || hasWebsite === '1';
  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { name: regex },
      { businessName: regex },
      { email: regex },
      { phone: regex },
      { website: regex },
      { country: regex },
      { city: regex },
      { address: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [leads, total] = await Promise.all([
    Lead.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
    Lead.countDocuments(query),
  ]);

  success(res, 'Leads fetched successfully', { leads, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).lean();
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  success(res, 'Lead fetched successfully', { lead });
});

async function ensureClientFromLead(lead) {
  if (lead.client?.clientId) {
    return Client.findById(lead.client.clientId);
  }

  const identifier = lead.phone || lead.email || lead.website;
  let client = null;
  if (identifier) {
    const query = { $or: [{ phone: lead.phone }, { email: lead.email }, { website: lead.website }] };
    client = await Client.findOne(query);
  }

  const isRepeat = Boolean(client);
  if (!client) {
    client = await Client.create({
      name: lead.businessName || lead.name,
      businessName: lead.businessName || lead.name,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      country: lead.country,
      city: lead.city,
      address: lead.address,
      source: lead.source,
      leadIds: [lead._id],
      repeatClient: false,
    });
  } else {
    client.leadIds.addToSet(lead._id);
    client.repeatClient = true;
    await client.save();
  }

  lead.client = { isClient: true, clientId: client._id };
  await lead.save();

  await Project.create({
    clientId: client._id,
    leadId: lead._id,
    title: `Project for ${client.name}`,
    amount: 0,
    status: 'active',
  });

  return client;
}

export const updateLead = asyncHandler(async (req, res) => {
  const { status, notes, followUp, ...rest } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  if (status) {
    const oldStatus = lead.status;
    lead.status = status;
    if (statusDates[status]) {
      lead[statusDates[status]] = new Date();
    }
    if (status === 'no_response' && oldStatus !== 'no_response') {
      lead.followUp.required = true;
    }
    if (status === 'closed_client') {
      await ensureClientFromLead(lead);
    }
  }

  if (notes !== undefined) lead.notes = notes;
  if (followUp) {
    lead.followUp = { ...lead.followUp, ...followUp };
  }

  Object.assign(lead, rest);
  if (rest.website !== undefined) {
    lead.website = normalizeWebsite(rest.website);
    lead.hasWebsite = Boolean(lead.website);
  }
  await lead.save();

  success(res, 'Lead updated successfully', { lead });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  success(res, 'Lead deleted successfully', { lead });
});

export const getLeadsBySource = asyncHandler(async (req, res) => {
  const { source } = req.params;
  const leads = await Lead.find({ source }).sort({ createdAt: -1 }).lean();
  success(res, 'Leads fetched successfully', { leads });
});

export const analyzeLeadWebsite = asyncHandler(async (req, res) => {
  const analysis = await analyzeWebsite(req.params.id);
  success(res, 'Website analyzed successfully', { analysis });
});

export const getLeadAnalysis = asyncHandler(async (req, res) => {
  const analysis = await getAnalysisByLead(req.params.id);
  success(res, 'Analysis fetched successfully', { analysis });
});

export const generateLeadEmail = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).lean();
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  const analysis = lead.websiteAnalysis?.analysisId ? await getAnalysisByLead(lead._id) : null;
  const email = await generateEmail(lead, analysis);
  success(res, 'Email generated successfully', { email });
});
