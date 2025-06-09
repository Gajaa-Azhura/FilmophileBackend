import express from 'express';
import { registerUser, loginUser, updateUser, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/users/:id', protect, updateUser);
router.delete('/users/:id', protect, deleteUser);

export default router;