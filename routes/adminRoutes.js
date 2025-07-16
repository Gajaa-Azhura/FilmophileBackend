import express from 'express';
import {
  approveFilm,
  rejectFilm,
  getAllPendingFilms,
  getAllFilms,
  getAllUsers,
  getAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  testApproveFilm
} from '../controllers/adminController.js';
import { deleteFilm } from '../controllers/filmController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/pending', protect, isAdmin, getAllPendingFilms);
router.get('/all', protect, isAdmin, getAllFilms);
router.put('/approve/:id', protect, isAdmin, approveFilm);
router.put('/test-approve/:id', protect, isAdmin, testApproveFilm);
router.put('/reject/:id', protect, isAdmin, rejectFilm);
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/film/:id', protect, isAdmin, deleteFilm);
router.get('/profile', protect, isAdmin, getAdminProfile);
router.put('/profile', protect, isAdmin, updateAdminProfile);
router.delete('/profile', protect, isAdmin, deleteAdminProfile);

export default router;