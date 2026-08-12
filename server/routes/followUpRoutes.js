import { Router } from 'express';
import { listFollowUps, createFollowUp, updateFollowUp, endOfDayProcess } from '../controllers/followUpController.js';

const router = Router();

router.get('/', listFollowUps);
router.post('/', createFollowUp);
router.post('/process', endOfDayProcess);
router.patch('/:id', updateFollowUp);

export default router;
