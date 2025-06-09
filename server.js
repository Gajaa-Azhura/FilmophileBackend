import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import filmRoutes from './routes/filmRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js'; // Updated to use providerRoutes

import errorHandler from './middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 Route registration
app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes); // Updated path

// 🔍 Temporary test route
app.get('/api/health', (req, res) => {
  res.send('Server running and routes active');
});

// 🛑 Catch-all 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// 🧯 Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));