import Film from '../models/Films.js';

export const uploadFilm = async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl } = req.body;
  try {
    const film = await Film.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      uploadedBy: req.user._id,
    });
    res.status(201).json(film);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const getAllApprovedFilms = async (req, res) => {
  try {
    const films = await Film.find({ status: 'approved' }).populate('uploadedBy', 'name');
    res.json(films);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approved films' });
  }
};

export const approveFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Film not found' });
    film.status = 'approved';
    await film.save();
    res.json({ message: 'Film approved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve film' });
  }
};

export const getAllPendingFilms = async (req, res) => {
  try {
    const films = await Film.find({ status: 'pending' });
    res.json(films);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending films' });
  }
};