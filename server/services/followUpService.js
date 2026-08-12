import FollowUp from '../models/FollowUp.js';
import Lead from '../models/Lead.js';
import { startOfDay, endOfDay } from '../utils/date.js';

export async function getFollowUps(query = {}) {
  return FollowUp.find(query)
    .populate('leadId', 'name businessName source website hasWebsite phone email status')
    .sort({ createdAt: -1 });
}

export async function createOrUpdateFollowUp(leadId, data) {
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  let followUp = await FollowUp.findOne({ leadId });
  if (!followUp) {
    followUp = new FollowUp({ leadId });
  }

  if (data.nextFollowUpDate) followUp.nextFollowUpDate = new Date(data.nextFollowUpDate);
  if (data.notes !== undefined) followUp.notes = data.notes;
  if (data.status) followUp.status = data.status;
  if (data.lastContactDate) followUp.lastContactDate = new Date(data.lastContactDate);

  if (typeof data.count === 'number') {
    followUp.count = data.count;
  } else if (data.increment) {
    followUp.count = (followUp.count || 0) + 1;
  }

  await followUp.save();

  lead.followUp = {
    required: followUp.status === 'open',
    nextFollowUpDate: followUp.nextFollowUpDate,
    count: followUp.count,
    lastFollowUpDate: followUp.lastContactDate,
    notes: followUp.notes,
  };
  await lead.save();

  return followUp;
}

export async function processEndOfDay() {
  const start = startOfDay();
  const end = endOfDay();

  const leads = await Lead.find({
    status: 'contacted',
    contactedAt: { $gte: start, $lte: end },
    respondedAt: null,
    'client.isClient': false,
  });

  const results = [];
  for (const lead of leads) {
    lead.status = 'no_response';
    lead.followUp.required = true;
    await lead.save();

    const followUp = await createOrUpdateFollowUp(lead._id, {
      nextFollowUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      notes: 'Auto-generated from end-of-day workflow: contacted today with no response.',
      status: 'open',
      lastContactDate: lead.contactedAt,
      increment: true,
    });
    results.push(followUp);
  }

  return { processed: results.length, followUps: results };
}
