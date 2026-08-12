import Client from '../models/Client.js';
import Project from '../models/Project.js';
import ClientOffer from '../models/ClientOffer.js';
import { asyncHandler, success } from '../utils/response.js';
import { now, addDays } from '../utils/date.js';

export const getClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().sort({ createdAt: -1 }).lean();
  success(res, 'Clients fetched successfully', { clients });
});

export const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).lean();
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

  const [projects, offers] = await Promise.all([
    Project.find({ clientId: client._id }).sort({ createdAt: -1 }).lean(),
    ClientOffer.find({ clientId: client._id }).sort({ createdAt: -1 }).lean(),
  ]);

  const activeSupport = projects
    .filter((p) => p.status === 'support' || (p.supportEndDate && new Date(p.supportEndDate) > new Date()))
    .map((p) => {
      const end = p.supportEndDate ? new Date(p.supportEndDate) : null;
      const daysRemaining = end ? Math.ceil((end - now().toDate()) / (1000 * 60 * 60 * 24)) : null;
      let supportStatus = 'Expired';
      if (end) {
        if (daysRemaining > 3) supportStatus = 'Active';
        else if (daysRemaining >= 0) supportStatus = 'Ending Soon';
      }
      return { ...p, daysRemaining, supportStatus };
    });

  success(res, 'Client fetched successfully', { client: { ...client, projects, offers, activeSupport } });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  success(res, 'Client updated successfully', { client });
});
