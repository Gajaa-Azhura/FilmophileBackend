import Film from '../models/Films.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mov'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG, PNG, MP4, and MOV are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1000000000000 } // 1000000MB limit
});

export const uploadFilm = async (req, res) => {
  try {
    upload.fields([{ name: 'videoUrl', maxCount: 1 }, { name: 'thumbnailUrl', maxCount: 1 }])(req, res, async (err) => {
      if (err) {
        console.error('Multer Error:', err.message);
        return res.status(400).json({ message: 'File upload error', error: err.message });
      }

      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const film = await Film.create({
        title,
        description,
        videoUrl: req.files['videoUrl'][0].path,
        thumbnailUrl: req.files['thumbnailUrl'][0].path,
        uploadedBy: req.user.id,
        status: 'pending'
      });

      res.status(201).json(film);
    });
  } catch (error) {
    console.error('Server Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all approved films
export const getAllApprovedFilms = async (req, res) => {
  try {
    const films = await Film.find({ status: 'approved' }).populate('uploadedBy', 'name');
    res.json(films);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a film
export const updateFilm = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl } = req.body;
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });

    if (req.user.id !== film.uploadedBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this film' });
    }

    if (title) film.title = title;
    if (description) film.description = description;
    if (videoUrl) film.videoUrl = videoUrl;
    if (thumbnailUrl) film.thumbnailUrl = thumbnailUrl;
    const updatedFilm = await film.save();
    res.json({
      message: 'Film updated successfully',
      film: updatedFilm
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a film
export const deleteFilm = async (req, res) => {
  try {
    console.log('Delete Film - Request params:', req.params);
    console.log('Delete Film - Request user:', req.user);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid film ID' });
    }
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });

    if (req.user.id !== film.uploadedBy.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this film' });
    }

    await film.deleteOne();
    console.log('Delete Film - Film removed:', req.params.id);
    res.json({ message: 'Film deleted successfully' });
  } catch (error) {
    console.error('Delete Film - Error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error while deleting film', error: error.message });
  }
};