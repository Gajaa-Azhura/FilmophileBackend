import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getArtistProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Artist not found' });
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this artist profile' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching artist profile' });
  }
};

export const updateArtistProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Artist not found' });
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this artist profile' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Artist profile updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating artist profile' });
  }
};

export const deleteArtistProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Artist not found' });
    if (req.user.role !== 'admin' && req.user.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this artist profile' });
    }
    await user.remove();
    res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting artist profile' });
  }
};