import express from 'express';
import { uploadFilm, getAllApprovedFilms } from '../controllers/filmController.js';
import { protect, isProvider } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/upload', protect, isProvider, uploadFilm);
router.get('/approved', getAllApprovedFilms);

export default router;
