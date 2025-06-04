import Film from '../models/Films.js';

// Approve a film
export const approveFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Film not found' });

    film.status = 'approved';
    await film.save();

    res.json({ message: 'Film approved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while approving film' });
  }
};

// Reject a film
export const rejectFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Film not found' });

    film.status = 'rejected';
    await film.save();

    res.json({ message: 'Film rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error while rejecting film' });
  }
};

// Get all films with status "pending"
export const getAllPendingFilms = async (req, res) => {
  try {
    const pendingFilms = await Film.find({ status: 'pending' }).populate('uploadedBy', 'name email');
    res.json(pendingFilms);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching pending films' });
  }
};

// Get all uploaded films (for admin panel view)
export const getAllFilms = async (req, res) => {
  try {
    const films = await Film.find().populate('uploadedBy', 'name email');
    res.json(films);
  } catch (error) {
    res.status(500).json({ error: 'Server error while fetching all films' });
  }
};
