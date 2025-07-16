

import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

// Securely load Stripe secret key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables!');
  throw new Error('Stripe secret key missing');
}
const stripe = new Stripe(stripeSecretKey);

// Assumes protect middleware is used to set req.user
export const createSubscription = async (req, res) => {
  try {
    const { paymentMethodId, priceId } = req.body;
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice;
    const paymentIntent = invoice ? invoice.payment_intent : null;

    if (!paymentIntent) {
      return res.json({
        success: false,
        subscriptionId: subscription.id,
        clientSecret: null,
        status: null,
        error: 'No payment intent available. Payment may not be required or was not created.'
      });
    }

    if (paymentIntent.status === 'canceled') {
      return res.json({
        success: false,
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        error: 'Payment was canceled. Please try again with a valid card.'
      });
    }

    // Save subscription info to MongoDB
    try {
      const userId = req.user?.id;
      const planName = req.body.planName || '';
      if (userId && planName && priceId && customer.id && subscription.id && subscription.status) {
        await Subscription.create({
          user: userId,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          planName,
          priceId,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
          createdAt: new Date(),
        });
      } else {
        console.error('Missing required subscription fields:', { userId, planName, priceId, customerId: customer.id, subscriptionId: subscription.id, status: subscription.status });
      }
    } catch (dbErr) {
      console.error('DB Save Error:', dbErr);
      // Don't block payment response if DB fails
    }
    res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      error: null,
    });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ success: false, message: 'Payment processing failed', error: err.message });
  }
};
