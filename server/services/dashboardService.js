import Lead from '../models/Lead.js';
import FollowUp from '../models/FollowUp.js';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, now } from '../utils/date.js';

const statusList = ['pending', 'contacted', 'responded', 'no_response', 'closed_client'];

async function statusCounts(start, end) {
  const match = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
  const counts = { total: 0 };
  for (const s of statusList) {
    counts[s] = 0;
  }

  const results = await Lead.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const totalResult = await Lead.countDocuments(match);
  counts.total = totalResult;
  for (const r of results) {
    if (r._id) counts[r._id] = r.count;
  }
  return counts;
}

async function sourceDistribution(start, end) {
  const match = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
  return Lead.aggregate([
    { $match: match },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);
}

async function websiteAvailability(start, end) {
  const match = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
  const withSite = await Lead.countDocuments({ ...match, hasWebsite: true });
  const withoutSite = await Lead.countDocuments({ ...match, hasWebsite: false });
  return { withWebsite: withSite, withoutWebsite: withoutSite };
}

async function countryDistribution(start, end) {
  const match = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
  return Lead.aggregate([
    { $match: { ...match, country: { $exists: true, $ne: '' } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
}

async function conversionMetrics(start, end) {
  const match = start && end ? { createdAt: { $gte: start, $lte: end } } : {};
  const total = await Lead.countDocuments(match);
  const contacted = await Lead.countDocuments({ ...match, status: 'contacted' });
  const responded = await Lead.countDocuments({ ...match, status: 'responded' });
  const closed = await Lead.countDocuments({ ...match, status: 'closed_client' });
  const conversionRate = total ? Number(((closed / total) * 100).toFixed(2)) : 0;
  const responseRate = contacted ? Number(((responded / contacted) * 100).toFixed(2)) : 0;
  return { total, contacted, responded, closed, conversionRate, responseRate };
}

async function eventCounts(field, start, end) {
  const query = {};
  query[field] = { $gte: start, $lte: end };
  return Lead.countDocuments(query);
}

async function followUpMetrics() {
  const n = now().toDate();
  const open = await FollowUp.countDocuments({ status: 'open' });
  const overdue = await FollowUp.countDocuments({ status: 'open', nextFollowUpDate: { $lt: n } });
  return { pending: open, overdue };
}

async function avgContactToResponse() {
  const result = await Lead.aggregate([
    { $match: { status: 'responded', contactedAt: { $exists: true }, respondedAt: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgHours: { $avg: { $divide: [{ $subtract: ['$respondedAt', '$contactedAt'] }, 3600000] } },
      },
    },
  ]);
  return result[0]?.avgHours ? Number(result[0].avgHours.toFixed(2)) : 0;
}

export async function getDashboardStats() {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const todayStatuses = await statusCounts(todayStart, todayEnd);
  const monthStatuses = await statusCounts(monthStart, monthEnd);
  const allTimeStatuses = await statusCounts();

  return {
    today: {
      ...todayStatuses,
      contacts: await eventCounts('contactedAt', todayStart, todayEnd),
      responses: await eventCounts('respondedAt', todayStart, todayEnd),
      closed: await eventCounts('closedAt', todayStart, todayEnd),
    },
    month: {
      ...monthStatuses,
      contacts: await eventCounts('contactedAt', monthStart, monthEnd),
      responses: await eventCounts('respondedAt', monthStart, monthEnd),
      closed: await eventCounts('closedAt', monthStart, monthEnd),
      conversion: await conversionMetrics(monthStart, monthEnd),
    },
    allTime: allTimeStatuses,
    analytics: {
      sources: await sourceDistribution(),
      websiteAvailability: await websiteAvailability(),
      countries: await countryDistribution(),
      conversion: await conversionMetrics(),
      followUps: await followUpMetrics(),
      avgContactToResponseHours: await avgContactToResponse(),
    },
  };
}
