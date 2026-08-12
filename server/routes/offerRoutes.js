import { Router } from 'express';
import { createOffer, getOffers, getOfferById, getOfferPdf, updateOfferStatus } from '../controllers/offerController.js';

const router = Router();

router.post('/', createOffer);
router.get('/', getOffers);
router.get('/:id', getOfferById);
router.get('/:id/pdf', getOfferPdf);
router.patch('/:id', updateOfferStatus);

export default router;
