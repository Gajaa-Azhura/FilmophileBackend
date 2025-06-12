import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { versionKey: false });

filmSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

filmSchema.index({ uploadedBy: 1, status: 1 });

const Film = mongoose.model('Film', filmSchema);
export default Film;