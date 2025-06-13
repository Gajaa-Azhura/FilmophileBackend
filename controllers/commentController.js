import Film from '../models/Films.js';
import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  try {
    const { filmId, text, rating } = req.body;
    const film = await Film.findById(filmId);
    if (!film) return res.status(404).json({ message: 'Film not found' });
    if (!film.isApproved) return res.status(403).json({ message: 'Film not approved' });

    const comment = new Comment({
      film: filmId,
      user: req.user.id,
      text,
      rating
    });
    await comment.save();

    film.comments.push(comment._id);
    await film.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getComments = async (req, res) => {
  try {
    const { filmId } = req.params;
    const film = await Film.findById(filmId);
    if (!film || !film.isApproved) return res.status(404).json({ message: 'Film not found or not approved' });

    const comments = await Comment.find({ film: filmId }).populate('user', 'username');
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};