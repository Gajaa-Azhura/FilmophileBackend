
import express from 'express';
import multer from 'multer';
import { protect, isProvider, isAdmin } from '../middleware/authMiddleware.js';
import { uploadFilm, getAllApprovedFilms, getAllPendingFilms, updateFilm, deleteFilm, searchFilms, getAllFilms } from '../controllers/filmController.js';
import { addComment, getComments } from '../controllers/commentController.js';
import { rejectFilm } from '../controllers/adminController.js';

// ...existing code...


const router = express.Router();
const upload = multer();
// Admin route to reject a film
router.put('/:id/reject', protect, isAdmin, rejectFilm);

// Public route to get all approved films
router.get('/', getAllFilms);



router.post('/', protect, isProvider, upload.none(), uploadFilm);
router.post('/upload', protect, isProvider, upload.none(), uploadFilm);
router.get('/search', searchFilms);
router.get('/approved', protect, getAllApprovedFilms);
router.get('/pending', getAllPendingFilms);
router.put('/:id', protect, isAdmin, updateFilm);
router.delete('/:id', protect, deleteFilm);
router.post('/:filmId/comments', protect, addComment);
router.get('/:filmId/comments', protect, isProvider, isAdmin, getComments);

export default router;

