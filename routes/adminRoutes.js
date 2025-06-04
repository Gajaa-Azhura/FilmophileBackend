import express from 'express';
import {
  approveFilm,
  rejectFilm,
  getAllPendingFilms,
  getAllFilms
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', protect, isAdmin, getAllPendingFilms);
router.get('/all', protect, isAdmin, getAllFilms);
router.put('/approve/:id', protect, isAdmin, approveFilm);
router.put('/reject/:id', protect, isAdmin, rejectFilm);

export default router;
