import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { asyncHandler, success } from '../utils/response.js';
import { addDays } from '../utils/date.js';

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().populate('clientId', 'name businessName').sort({ createdAt: -1 }).lean();
  success(res, 'Projects fetched successfully', { projects });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  await updateClientTotals(project.clientId);
  success(res, 'Project created successfully', { project }, 201);
});

export const updateProject = asyncHandler(async (req, res) => {
  const { status, handoverDate } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  if (status) project.status = status;
  if (handoverDate) project.handoverDate = new Date(handoverDate);

  if (project.status === 'handed_over' || project.status === 'support' || project.status === 'completed') {
    if (!project.handoverDate) project.handoverDate = new Date();
    project.supportStartDate = project.handoverDate;
    project.supportEndDate = addDays(project.handoverDate, 14);
    if (project.status !== 'completed') project.status = 'support';
  }

  await project.save();
  await updateClientTotals(project.clientId);

  success(res, 'Project updated successfully', { project });
});

async function updateClientTotals(clientId) {
  const projects = await Project.find({ clientId });
  const total = projects.reduce((sum, p) => sum + (p.amount || 0), 0);
  await Client.findByIdAndUpdate(clientId, { projectCount: projects.length, totalRevenue: total });
}
