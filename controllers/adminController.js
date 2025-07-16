import User from '../models/User.js';
import Film from '../models/Films.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const approveFilm = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[approveFilm] - Received request to approve film with ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`[approveFilm] - Invalid film ID: ${id}`);
      return res.status(400).json({ message: 'Invalid film ID' });
    }

    console.log(`[approveFilm] - Finding film with ID: ${id}`);
    const film = await Film.findById(id);

    if (!film) {
      console.error(`[approveFilm] - Film not found with ID: ${id}`);
      return res.status(404).json({ message: 'Film not found' });
    }
    console.log(`[approveFilm] - Found film: ${JSON.stringify(film)}`);

    if (film.status !== 'pending') {
      console.warn(`[approveFilm] - Film is not pending approval. Current status: ${film.status}`);
      return res.status(400).json({ message: 'Film is not pending approval' });
    }

    console.log(`[approveFilm] - Updating film status to 'approved'`);
    film.status = 'approved';

    console.log(`[approveFilm] - Saving updated film...`);
    await film.save();
    console.log(`[approveFilm] - Film saved successfully`);

    res.json({ message: 'Film approved successfully' });
  } catch (error) {
    console.error('[approveFilm] - An error occurred while approving the film:', error);
    res.status(500).json({ message: 'Server error while approving film', error: error.message, stack: error.stack });
  }
};

export const rejectFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });
    if (film.status !== 'pending') return res.status(400).json({ message: 'Film is not pending approval' });

    await film.remove();
    res.json({ message: 'Film rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while rejecting film' });
  }
};

export const getAllPendingFilms = async (req, res) => {
  try {
    const films = await Film.find({ status: 'pending' }).populate('uploadedBy', 'name email');
    res.json(films);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching pending films' });
  }
};

export const getAllFilms = async (req, res) => {
  try {
    const films = await Film.find().populate('uploadedBy', 'name email');
    res.json(films);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching all films' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Requires admin role' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Admin not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching admin profile' });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Requires admin role' });
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: 'Admin profile updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating admin profile' });
  }
};

export const deleteAdminProfile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Requires admin role' });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });

    if (req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this admin' });
    }

    await user.remove();
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting admin' });
  }
};

export const testApproveFilm = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[testApproveFilm] - Received request to approve film with ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`[testApproveFilm] - Invalid film ID: ${id}`);
      return res.status(400).json({ message: 'Invalid film ID' });
    }

    console.log(`[testApproveFilm] - Finding film with ID: ${id}`);
    const film = await Film.findById(id);

    if (!film) {
      console.error(`[testApproveFilm] - Film not found with ID: ${id}`);
      return res.status(404).json({ message: 'Film not found' });
    }
    console.log(`[testApproveFilm] - Found film: ${JSON.stringify(film)}`);

    if (film.status !== 'pending') {
      console.warn(`[testApproveFilm] - Film is not pending approval. Current status: ${film.status}`);
      return res.status(400).json({ message: 'Film is not pending approval' });
    }

    console.log(`[testApproveFilm] - Updating film status to 'approved'`);
    film.status = 'approved';

    console.log(`[testApproveFilm] - Saving updated film...`);
    await film.save();
    console.log(`[testApproveFilm] - Film saved successfully`);

    res.json({ message: 'Film approved successfully' });
  } catch (error) {
    console.error('[testApproveFilm] - An error occurred while approving the film:', error);
    res.status(500).json({ message: 'Server error while approving film', error: error.message, stack: error.stack });
  }
};