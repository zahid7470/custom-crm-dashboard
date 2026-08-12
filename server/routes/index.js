import { Router } from 'express';
import leadRoutes from './leadRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import followUpRoutes from './followUpRoutes.js';
import offerRoutes from './offerRoutes.js';
import clientRoutes from './clientRoutes.js';
import projectRoutes from './projectRoutes.js';

const router = Router();

router.use('/leads', leadRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/offers', offerRoutes);
router.use('/clients', clientRoutes);
router.use('/projects', projectRoutes);

export default router;
