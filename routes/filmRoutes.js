import express from 'express';
import { uploadFilm, getAllApprovedFilms, updateFilm, deleteFilm } from '../controllers/filmController.js';
import { protect, isProvider } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, isProvider, uploadFilm);
router.get('/approved', getAllApprovedFilms);
router.put('/:id', protect, [isProvider, isAdmin], updateFilm); // Adjusted path
router.delete('/:id', protect, [isProvider, isAdmin], deleteFilm); // Adjusted path

export default router;