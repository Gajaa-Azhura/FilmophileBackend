// models/filmModel.js
import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const Film = mongoose.model('Film', filmSchema);
export default Film;
