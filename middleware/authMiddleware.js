import jwt from 'jsonwebtoken';



export const isProvider = (req, res, next) => {
  console.log('isProvider middleware - Checking role:', req.user?.role);
  if (!req.user || req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Requires provider role' });
  }
  next();
};

// Other middleware (isAdmin) remains unchanged
export const isAdmin = (req, res, next) => {
  console.log('isAdmin middleware - Checking role:', req.user?.role);
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Requires admin role' });
  }
  next();
};

export const protect = (req, res, next) => {
  console.log('Protect middleware - Authorization:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    console.log('Protect middleware - Decoded user:', req.user);
    next();
  } catch (err) {
    console.error('Protect middleware - Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};