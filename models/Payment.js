 const express = require('express');
     const stripe = require('stripe')('sk_test_your_secret_key_here'); // Replace with your secret key
     const cors = require('cors');

     const app = express();
     app.use(express.json());
     app.use(cors({ origin: 'http://localhost:5173' }));

     app.post('/api/payments/create-subscription', async (req, res) => {
       try {
         const { paymentMethodId, priceId } = req.body;
         const subscription = await stripe.subscriptions.create({
           payment_method: paymentMethodId,
           payment_behavior: 'default_incomplete',
           price: priceId,
           expand: ['latest_invoice.payment_intent'],
         });

         if (subscription.latest_invoice.payment_intent.status === 'succeeded') {
           res.json({ success: true, message: 'Subscription activated' });
         } else {
           res.status(400).json({ success: false, message: 'Payment pending' });
         }
       } catch (err) {
         console.error('Stripe Error:', err);
         res.status(500).json({ success: false, message: 'Payment processing failed' });
       }
     });

     app.listen(3000, () => console.log('Server running on port 3000'))