import axios from 'axios';
import Lead from '../models/Lead.js';
import WebsiteAnalysis from '../models/WebsiteAnalysis.js';
import { normalizeWebsite } from '../utils/normalize.js';

const ANALYSER_URL = process.env.WEBSITE_ANALYSER_URL || 'http://127.0.0.1:8000';

export async function analyzeWebsite(leadId) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  const url = normalizeWebsite(lead.website);
  if (!url) throw new Error('Lead does not have a website');

  let response;
  try {
    const { data } = await axios.post(`${ANALYSER_URL}/analyse`, {
      url,
      fetch_mode: 'stealthy',
      headless: true,
      timeout: 30,
      deep_scan: false,
      enable_lighthouse: true,
      lighthouse_preset: 'both',
    });
    response = data;
  } catch (err) {
    throw new Error(`Website analyzer is currently unavailable: ${err.message}`);
  }

  const analysis = await WebsiteAnalysis.create({
    leadId: lead._id,
    url,
    status: response?.status === 'success' ? 'success' : 'error',
    response,
    error: response?.error,
  });

  lead.websiteAnalysis = {
    analyzed: true,
    analysisId: analysis._id,
    analyzedAt: analysis.analyzedAt,
  };
  await lead.save();

  return analysis;
}

export async function getAnalysisByLead(leadId) {
  return WebsiteAnalysis.findOne({ leadId }).sort({ analyzedAt: -1 });
}
