
import express from 'express';
import { deleteUser, updateUser, registerUser, loginUser, getAllUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);
// Login
router.post('/login', loginUser);
// Update user by ID (protected)
router.put('/:id', protect, updateUser);
// Delete user by ID (protected)
router.delete('/:id', protect, deleteUser);
// Get all users (optional: protect if needed)
router.get('/', getAllUsers);

export default router;
