import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';

export const deleteUser = async (req, res) => {
  try {
    console.log('Delete User - Request params:', req.params);
    console.log('Delete User - Request user:', req.user);
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.user || (req.user.id !== user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Unauthorized to delete this user' });
    }

    await user.deleteOne(); // Ensure this is the method used
    console.log('Delete User - User removed:', req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User - Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while deleting user', error: error.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    console.log('Request params:', req.params); // Debug: Check :id
    console.log('Request user:', req.user); // Debug: Check authenticated user
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.user || (req.user.id !== user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    const updatedUser = await user.save();
    res.json({
      message: 'User updated successfully',
      user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error while updating user', error: error.message });
  }
};



// Other functions (registerUser, loginUser) remain unchanged
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ username, email, password: hashedPassword, role });

    if (user) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '48h',
      });

      res.status(201).json({
        user: {
          _id: user._id,
          username: user.username,
          email,
          role,
        },
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while registering user' });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
        const role = email === 'admin1@gmail.com' ? 'admin' : user.role;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '48h' });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error while logging in' });
  }
};
