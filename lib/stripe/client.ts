// lib/stripe/client.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
        throw new Error("Missing Stripe Publishable Key");
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
