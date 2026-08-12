import path from 'path';
import fs from 'fs/promises';
import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import ClientOffer from '../models/ClientOffer.js';
import Project from '../models/Project.js';
import { updateClientTotals } from './projectController.js';
import { generateOfferPdf } from '../services/offerPdfService.js';
import { asyncHandler, success } from '../utils/response.js';

async function nextOfferId() {
  const year = new Date().getFullYear();
  const prefix = `OFF-${year}-`;
  const last = await ClientOffer.findOne({ offerId: { $regex: `^${prefix}` } })
    .sort({ offerId: -1 })
    .lean();
  let seq = 1;
  if (last) {
    const parts = last.offerId.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

async function getOrCreateClientFromLead(lead) {
  let client = lead.client?.clientId ? await Client.findById(lead.client.clientId) : null;
  if (client) return { client, isRepeat: true };

  const query = { $or: [] };
  if (lead.phone) query.$or.push({ phone: lead.phone });
  if (lead.email) query.$or.push({ email: lead.email });
  if (lead.website) query.$or.push({ website: lead.website });
  if (query.$or.length) {
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
      projectCount: 0,
      totalRevenue: 0,
      repeatClient: false,
    });
  } else {
    client.leadIds.addToSet(lead._id);
    client.repeatClient = true;
    await client.save();
  }

  lead.client = { isClient: true, clientId: client._id };
  await lead.save();

  return { client, isRepeat };
}

export const createOffer = asyncHandler(async (req, res) => {
  const { leadId, clientName, clientDetails, requirement, service, scope, amount, status } = req.body;
  if (!leadId || !requirement || !service || !amount) {
    return res.status(400).json({ success: false, message: 'leadId, requirement, service and amount are required' });
  }

  const lead = await Lead.findById(leadId);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

  const { client, isRepeat } = await getOrCreateClientFromLead(lead);

  const offerId = await nextOfferId();
  const offer = await ClientOffer.create({
    offerId,
    leadId: lead._id,
    clientId: client._id,
    clientName: clientName || client.name,
    clientDetails: clientDetails || `${client.country || ''} ${client.city || ''} ${client.phone || ''}`.trim(),
    clientStatus: isRepeat ? 'repeat' : 'new',
    requirement,
    service,
    scope,
    amount,
    status: status || 'draft',
  });

  let pdfPath;
  try {
    pdfPath = await generateOfferPdf(offer.toObject());
    offer.pdfPath = pdfPath;
    await offer.save();
  } catch (err) {
    console.error('PDF generation failed:', err.message);
  }

  success(res, 'Offer created successfully', { offer, client }, 201);
});

export const getOffers = asyncHandler(async (req, res) => {
  const offers = await ClientOffer.find().sort({ createdAt: -1 }).lean();
  success(res, 'Offers fetched successfully', { offers });
});

export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await ClientOffer.findById(req.params.id).lean();
  if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
  success(res, 'Offer fetched successfully', { offer });
});

export const getOfferPdf = asyncHandler(async (req, res) => {
  const offer = await ClientOffer.findById(req.params.id).lean();
  if (!offer || !offer.pdfPath) return res.status(404).json({ success: false, message: 'PDF not found' });

  const resolvedPath = path.resolve(offer.pdfPath);
  try {
    await fs.access(resolvedPath);
  } catch {
    return res.status(404).json({ success: false, message: 'PDF file not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${offer.offerId}.pdf`);
  res.sendFile(resolvedPath);
});

export const updateOfferStatus = asyncHandler(async (req, res) => {
  const { status, ...fields } = req.body;
  const offer = await ClientOffer.findById(req.params.id);
  if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });

  if (Object.keys(fields).length > 0) {
    Object.assign(offer, fields);
  }
  if (status) offer.status = status;
  await offer.save();

  if (status === 'accepted') {
    let project = await Project.findOne({ offerId: offer._id });
    if (!project) {
      project = await Project.create({
        clientId: offer.clientId,
        leadId: offer.leadId,
        offerId: offer._id,
        title: `${offer.service} for ${offer.clientName}`,
        requirement: offer.requirement,
        service: offer.service,
        description: offer.scope,
        amount: offer.amount,
        status: 'active',
      });
      await updateClientTotals(offer.clientId);

      const lead = await Lead.findById(offer.leadId);
      if (lead && lead.status !== 'closed_client') {
        lead.status = 'closed_client';
        lead.closedAt = new Date();
        lead.client = { isClient: true, clientId: offer.clientId };
        await lead.save();
      }
    }
  }

  success(res, 'Offer updated successfully', { offer });
});
