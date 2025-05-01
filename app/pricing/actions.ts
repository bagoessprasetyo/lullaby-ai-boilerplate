// app/pricing/actions.ts
'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers'; // To get the host for redirect URLs
import { redirect } from 'next/navigation'; // Use redirect for server actions
import Stripe from 'stripe';

export async function createCheckoutSession(priceId: string): Promise<{ sessionId?: string; error?: string }> {
  if (!priceId || !priceId.startsWith('price_')) {
    return { error: 'Invalid or missing Price ID.' };
  }

  const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const appUrl = `${protocol}://${host}`;

  const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/pricing?canceled=true`;

  try {
    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(params);

    // Instead of returning sessionId, we directly redirect using Stripe's URL
    // but for client-side handling with stripe.js, we return the ID
     if (!checkoutSession.url) {
         throw new Error("Checkout session URL is missing");
     }
     // return { redirectUrl: checkoutSession.url }; // Option 1: Redirect server-side
     return { sessionId: checkoutSession.id };      // Option 2: Return ID for client-side stripe.js

  } catch (err) {
    console.error('Error creating checkout session:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return { error: `Could not create checkout session: ${errorMessage}` };
  }
}