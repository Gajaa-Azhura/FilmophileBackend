import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import Film from './models/Films.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

const dummyPayments = [
  {
    filmId: '68491da58db0b3de5793165c', // Match a film's _id
    userId: '6842b031964a67b4dee63a4a', // Match a user's _id
    amount: 999, // In cents (e.g., $9.99)
    currency: 'usd',
    status: 'succeeded'
  },
  {
    filmId: '507f1f77bcf86cd799439012', // Match another film's _id
    userId: '6847d79a0ce5d83eb702475d',
    amount: 499, // In cents (e.g., $4.99)
    currency: 'usd',
    status: 'pending'
  }
];

const seedPaymentData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true });
    console.log('MongoDB connected for seeding');

    // Optional: Clear existing payment data if you have a Payment model
    // await Payment.deleteMany(); // Uncomment if you have a Payment model

    // Simulate payment intents with Stripe
    for (const payment of dummyPayments) {
      const film = await Film.findById(payment.filmId);
      if (!film || !film.isApproved) {
        console.log(`Skipping payment for invalid film ${payment.filmId}`);
        continue;
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: payment.amount,
        currency: payment.currency,
        description: `Payment for ${film.title}`,
        metadata: {
          filmId: payment.filmId,
          userId: payment.userId
        },
        payment_method_types: ['card'],
        // In test mode, use a test card (e.g., 4242 4242 4242 4242)
        // This would typically come from a frontend, but for dummy data, we simulate success
      });

      console.log(`Created payment intent for ${film.title}:`, paymentIntent.id);
    }

    mongoose.connection.close();
    console.log('Payment seeding completed');
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
};

seedPaymentData();