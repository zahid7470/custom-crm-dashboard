import { getDashboardStats } from '../services/dashboardService.js';
import { asyncHandler, success } from '../utils/response.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  success(res, 'Dashboard stats fetched successfully', stats);
});
