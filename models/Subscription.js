import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },
  planName: { type: String, required: true },
  priceId: { type: String, required: true },
  status: { type: String, required: true },
  currentPeriodEnd: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Subscription', subscriptionSchema);
