import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import filmRoutes from './routes/filmRoutes.js';
import { connectDB } from './config/db.js'; // Corrected path// Assuming db.js handles MongoDB connection
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import errorHandler from './middleware/errorHandler.js'; // Custom error handler middleware
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use('/api/films', filmRoutes);

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

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/films', filmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);

app.get('/api/health', (req, res) => res.send('Server running and routes active'));

app.use((req, res) => res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method }));

app.use(errorHandler);

connectDB().then(() => {
  server.listen(process.env.PORT || 5000, () => console.log('Server running on port', process.env.PORT || 3000));
}).catch(err => console.error('Database connection error:', err));























