import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
thumbnailUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
  },
  views: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Film', filmSchema);