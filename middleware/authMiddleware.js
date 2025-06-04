import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
};

export const isProvider = (req, res, next) => {
  if (req.user?.role === 'provider') return next();
  res.status(403).json({ error: 'Provider access required' });
};

// ---------- middleware/errorHandler.js ----------
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
};

export default errorHandler;