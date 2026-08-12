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
  const { id } = req.params;
  const { leadId, ...data } = req.body;
  const followUp = await createOrUpdateFollowUp(leadId || id, data);
  success(res, 'Follow-up updated successfully', { followUp });
});

export const endOfDayProcess = asyncHandler(async (req, res) => {
  const result = await processEndOfDay();
  success(res, 'End-of-day follow-up processing completed', result);
});
