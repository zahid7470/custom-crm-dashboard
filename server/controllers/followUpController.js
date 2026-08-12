import FollowUp from '../models/FollowUp.js';
import Lead from '../models/Lead.js';
import { getFollowUps, createOrUpdateFollowUp, processEndOfDay } from '../services/followUpService.js';
import { asyncHandler, success } from '../utils/response.js';

export const listFollowUps = asyncHandler(async (req, res) => {
  const followUps = await getFollowUps(req.query);
  success(res, 'Follow-ups fetched successfully', { followUps });
});

export const createFollowUp = asyncHandler(async (req, res) => {
  const { leadId, ...data } = req.body;
  const followUp = await createOrUpdateFollowUp(leadId, data);
  success(res, 'Follow-up created successfully', { followUp }, 201);
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id);
  if (!followUp) return res.status(404).json({ success: false, message: 'Follow-up not found' });

  const { notes, status, nextFollowUpDate, count } = req.body;
  if (notes !== undefined) followUp.notes = notes;
  if (status) followUp.status = status;
  if (nextFollowUpDate) followUp.nextFollowUpDate = new Date(nextFollowUpDate);
  if (typeof count === 'number') followUp.count = count;
  await followUp.save();

  const lead = await Lead.findById(followUp.leadId);
  if (lead) {
    lead.followUp = {
      required: followUp.status === 'open',
      nextFollowUpDate: followUp.nextFollowUpDate,
      count: followUp.count,
      lastFollowUpDate: followUp.lastContactDate,
      notes: followUp.notes,
    };
    await lead.save();
  }

  success(res, 'Follow-up updated successfully', { followUp });
});

export const endOfDayProcess = asyncHandler(async (req, res) => {
  const result = await processEndOfDay();
  success(res, 'End-of-day follow-up processing completed', result);
});
