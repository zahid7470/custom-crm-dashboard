import { Router } from 'express';
import { getClients, getClientById, updateClient } from '../controllers/clientController.js';

const router = Router();

router.get('/', getClients);
router.get('/:id', getClientById);
router.patch('/:id', updateClient);

export default router;
