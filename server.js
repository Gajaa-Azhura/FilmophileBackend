import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import filmRoutes from './routes/filmRoutes.js';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { default as User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Firebase Admin SDK Initialization
try {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  console.log('Attempting to load service account from:', serviceAccountPath); // Debug log
const serviceAccount = (await import(serviceAccountPath, { with: { type: 'json' } })).default;  initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('Firebase Admin initialized successfully');
} catch (err) {
  console.error('Firebase initialization error:', err);
  process.exit(1); // Exit if initialization fails
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

// Registration Endpoint
// app.post('/api/auth/register', (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
//   if (!/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: 'Invalid email format' });
//   res.status(201).json({ token: 'dummy-token', role: 'user', name });
// });

// Login Endpoint
// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ message: 'All fields are required' });
//   try {
//     const user = await User.findOne({ email });
//     if (user && password === 'vinojina72') { // Replace with proper password check
//       const jwtToken = jwt.sign({ email, role: 'user' }, process.env.JWT_SECRET || 'your-secure-jwt-secret', { expiresIn: '1h' });
//       res.status(200).json({ token: jwtToken, role: 'user', name: user.name });
//     } else {
//       res.status(400).json({ message: 'Invalid email or password' });
//     }
//   } catch (err) {
//     console.error('Login Error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

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

// GitHub Auth Endpoint
app.post('/api/auth/github', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const githubResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` },
    });
    const { login: name, email } = githubResponse.data;
    let finalEmail = email || `${login}@github.com`; // Fallback if email is missing
    if (!email) {
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${token}` },
      });
      finalEmail = emailResponse.data.find(e => e.primary)?.email || finalEmail;
    }

    let user = await User.findOne({ email: finalEmail });
    if (!user) {
      user = new User({ email: finalEmail, name, providerId: githubResponse.data.id, provider: 'github' });
      await user.save();
    }

    const jwtToken = jwt.sign({ email: finalEmail, role: 'user', provider: 'github' }, process.env.JWT_SECRET || 'your-secure-jwt-secret', { expiresIn: '1h' });
    res.status(200).json({ token: jwtToken, role: 'user', name });
  } catch (err) {
    console.error('GitHub Auth Error:', err);
    res.status(401).json({ message: 'Invalid GitHub token' });
  }
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);

// Health Check
app.get('/api/health', (req, res) => res.send('Server running and routes active'));

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method }));

// Error Handler
app.use(errorHandler);

// Start Server
connectDB()
  .then(() => {
    const PORT = process.env.PORT ;
    server.listen(PORT, () => {
      console.log('Server running on port', PORT);
    });
  })
  .catch(err => console.error('Database connection error:', err));