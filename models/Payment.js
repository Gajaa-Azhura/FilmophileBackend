import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  film: { type: mongoose.Schema.Types.ObjectId, ref: 'Film', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // In cents
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'succeeded', 'failed'], required: true },
  stripePaymentIntentId: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);