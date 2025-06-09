import Film from '../models/Films.js';

export const uploadFilm = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl } = req.body;
    const film = await Film.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      uploadedBy: req.user.id,
      status: 'pending',
    });
    res.status(201).json(film);
  } catch (error) {
    res.status(500).json({ message: 'Server error while uploading film' });
  }
};

export const getAllApprovedFilms = async (req, res) => {
  try {
    const films = await Film.find({ status: 'approved' }).populate('uploadedBy', 'name');
    res.json(films);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching approved films' });
  }
};

export const updateFilm = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl } = req.body;
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });

    if (req.user.role !== 'admin' && film.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this film' });
    }

    film.title = title || film.title;
    film.description = description || film.description;
    film.videoUrl = videoUrl || film.videoUrl;
    film.thumbnailUrl = thumbnailUrl || film.thumbnailUrl;
    await film.save();

    res.json({ message: 'Film updated successfully', film });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating film' });
  }
};

export const deleteFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: 'Film not found' });

    if (req.user.role !== 'admin' && film.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this film' });
    }

    await film.remove();
    res.json({ message: 'Film deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting film' });
  }
};