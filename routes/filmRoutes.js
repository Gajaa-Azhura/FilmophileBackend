import express from 'express';
import { protect, isProvider } from '../middleware/authMiddleware.js';
import { uploadFilm, getAllApprovedFilms, updateFilm, deleteFilm } from '../controllers/filmController.js';

const router = express.Router();

router.post('/upload', protect, isProvider, uploadFilm);
router.get('/approved', getAllApprovedFilms);
router.put('/:id', protect, isProvider, updateFilm);
router.delete('/:id', protect, isProvider, deleteFilm);

export default router;