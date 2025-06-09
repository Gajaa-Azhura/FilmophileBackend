import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import filmRoutes from './routes/filmRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js';

import errorHandler from './middleware/errorHandler.js'; // Verify this path

dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);

app.get('/api/health', (req, res) => {
  res.send('Server running and routes active');
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use(errorHandler); // Add as the last middleware

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));