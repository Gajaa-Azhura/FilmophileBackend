import express from 'express';
import { protect, isProvider, isAdmin } from '../middleware/authMiddleware.js';
import { uploadFilm, getAllApprovedFilms, getAllPendingFilms, updateFilm, deleteFilm, approveFilm, declineFilm } from '../controllers/filmController.js';
import { addComment, getComments } from '../controllers/commentController.js';
const router = express.Router();

router.post('/', protect, isProvider, uploadFilm);
router.post('/upload', protect, isProvider, uploadFilm);
router.get('/approved', protect, getAllApprovedFilms);
router.get('/pending', getAllPendingFilms);
router.put('/:id', protect, isProvider, updateFilm);
router.delete('/:id', protect, isProvider, deleteFilm);
router.post('/:filmId/comments', protect, addComment);
router.get('/:filmId/comments', protect, isProvider, isAdmin, getComments);
router.put('/:id/approve', protect, isAdmin, approveFilm);
router.put('/:id/decline', protect, isAdmin, declineFilm);

export default router;

