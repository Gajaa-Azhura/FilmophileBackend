import express from 'express';
import { protect, isProvider } from '../middleware/authMiddleware.js';
import { uploadFilm, getAllApprovedFilms, updateFilm, deleteFilm } from '../controllers/filmController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import {  isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/upload', protect, isProvider, uploadFilm);
router.get('/approved', getAllApprovedFilms);
router.put('/:id', protect, isProvider, updateFilm);
router.delete('/:id', protect, isProvider, deleteFilm);
router.post('/:filmId/comments', protect, addComment);
router.get('/:filmId/comments', protect, isProvider,isAdmin, getComments);

export default router;

