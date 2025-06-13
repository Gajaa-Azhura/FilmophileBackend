import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  film: { type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: false }, // Optional for reviews
  rating: { type: Number, min: 1, max: 5, required: true }, // Required for reviews
  isReview: { type: Boolean, default: false }, // Flag to distinguish reviews
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', commentSchema);