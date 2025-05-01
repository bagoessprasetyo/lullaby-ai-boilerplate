// lib/stripe/server.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing Stripe Secret Key');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil', // Use the latest API version
  typescript: true,
  // You can add appInfo for better tracking in Stripe logs
  // appInfo: {
  //   name: 'Your Project Name',
  //   version: '0.1.0',
  // },
});
