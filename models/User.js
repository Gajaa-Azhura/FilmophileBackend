import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
});

export default mongoose.model('User', userSchema);