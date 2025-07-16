import express from 'express';

import { getArtistProfile, updateArtistProfile, deleteArtistProfile, getProviderProfile } from '../controllers/providerController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();
// Route for provider profile (for ArtProviderProfile.jsx)
router.get('/profile', protect, getProviderProfile);

router.get('/artists/:id', protect, getArtistProfile);
router.put('/artists/:id', protect, updateArtistProfile);
router.delete('/artists/:id', protect,[isAdmin], deleteArtistProfile);

export default router;