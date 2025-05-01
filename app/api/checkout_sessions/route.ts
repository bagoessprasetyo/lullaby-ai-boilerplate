import { NextResponse, NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe'; // Your Stripe server-side instance
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Basic validation for price ID format (optional but recommended)
    if (!priceId.startsWith('price_')) {
        return NextResponse.json({ error: 'Invalid Price ID format' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback URL

    // Define success and cancel URLs
    const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`; // You can add session_id to confirmation page
    const cancelUrl = `${appUrl}/pricing?canceled=true`; // Redirect back to pricing page on cancellation

    // Create Checkout Sessions from body params.
    // See https://stripe.com/docs/api/checkout/sessions/create
    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'], // Add other payment methods if needed e.g., ['card', 'ideal']
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use 'payment' for one-time purchases
      success_url: successUrl,
      cancel_url: cancelUrl,
      // You can add more options here:
      // - customer_email: prefill email
      // - client_reference_id: associate session with your internal user ID
      // - subscription_data: trial periods, metadata, etc.
      // See: https://stripe.com/docs/api/checkout/sessions/create#create_checkout_session-subscription_data
    };

    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.create(params);

    // Return the session ID to the client
    return NextResponse.json({ sessionId: checkoutSession.id }, { status: 200 });

  } catch (err) {
    console.error('Error creating checkout session:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    // Return a generic error message in production for security
    return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 });
  }
}