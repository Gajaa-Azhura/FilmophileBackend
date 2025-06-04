export const validateFilmUpload = (req, res, next) => {
    const { title, description, category } = req.body;
  
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }
  
    // If using file uploads, validate file presence
    if (!req.file) {
      return res.status(400).json({ error: 'Film file is required' });
    }
  
    next();
  };
  