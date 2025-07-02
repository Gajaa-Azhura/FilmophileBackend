import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import filmRoutes from './routes/filmRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from './models/User.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Firebase Admin SDK Initialization (Windows-safe)
try {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.error('Firebase initialization error:', err);
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO: Track views
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('viewFilm', async (filmId) => {
    try {
      const Film = (await import('./models/FilmModel.js')).default;
      const film = await Film.findById(filmId);
      if (film && film.isApproved) {
        film.views += 1;
        await film.save();
        io.emit('viewUpdate', { filmId, views: film.views });
      }
    } catch (err) {
      console.error('Error updating views:', err);
    }
  });

  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});

// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const { email, name } = decodedToken;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, providerId: decodedToken.uid, provider: 'google' });
      await user.save();
    }

    const jwtToken = jwt.sign({ email, role: 'user', provider: 'google' }, process.env.JWT_SECRET || 'your-secure-jwt-secret', { expiresIn: '1h' });
    res.status(200).json({ token: jwtToken, role: 'user', name });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => res.send('Server running and routes active'));

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method }));
// Assuming you have a Film model
app.get('/api/films', async (req, res) => {
  try {
    const films = await Film.find(); // Fetch all films
    res.json(films);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch films' });
  }
});
app.get('/api/films/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ error: 'Film not found' });
    res.json(film);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch film' });
  }
});
// Error Handler
app.use(errorHandler);

// Start Server
connectDB()
  .then(() => {
    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      console.log('Server running on port', PORT);
    });
  })
  .catch(err => console.error('Database connection error:', err));