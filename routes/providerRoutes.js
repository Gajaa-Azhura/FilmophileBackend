import express from 'express';
import { getArtistProfile, updateArtistProfile, deleteArtistProfile } from '../controllers/providerController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/artists/:id', protect, getArtistProfile);
router.put('/artists/:id', protect, updateArtistProfile);
router.delete('/artists/:id', protect, deleteArtistProfile);

export default router;