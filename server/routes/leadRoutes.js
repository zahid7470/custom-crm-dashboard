import { Router } from 'express';
import {
  importLeadsHandler,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadsBySource,
  analyzeLeadWebsite,
  getLeadAnalysis,
  generateLeadEmail,
} from '../controllers/leadController.js';

const router = Router();

router.post('/import', importLeadsHandler);
router.get('/', getLeads);
router.get('/source/:source', getLeadsBySource);
router.get('/:id', getLeadById);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/analyse', analyzeLeadWebsite);
router.get('/:id/analysis', getLeadAnalysis);
router.post('/:id/generate-email', generateLeadEmail);

export default router;
