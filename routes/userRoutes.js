import express from 'express';
import { deleteUser, updateUser, registerUser, loginUser, getAllUsers } from '../controllers/authController.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);
// Login
router.post('/login', loginUser);
// Update user by ID
router.put('/:id', updateUser);
// Delete user by ID
router.delete('/:id', deleteUser);
// Get all users
router.get('/', getAllUsers);

export default router;
