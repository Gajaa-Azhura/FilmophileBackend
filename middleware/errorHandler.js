import { log } from 'console'; // Use native console for simplicity; consider a logging library like Winston in production

const errorHandler = (err, req, res, next) => {
  // Set default status and message
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Log the error for debugging
  log('Error Handler - Error Details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(error => error.message)
      .join(', ');
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  } else if (err.code === 11000) { // Duplicate key error (e.g., unique email)
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Show stack trace in development only
  });
};

export default errorHandler;