import User from '../models/User.js';
import Film from '../models/Films.js';
import bcrypt from 'bcryptjs';

export const approveFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });
    if (film.status !== 'pending') return res.status(400).json({ message: 'Film is not pending approval' });

    film.status = 'approved';
    await film.save();
    res.json({ message: 'Film approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while approving film' });
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