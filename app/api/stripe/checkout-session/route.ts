// app/api/stripe/checkout-session/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized: User not found' }), { status: 401 });
  }

  const { priceId, quantity = 1, metadata = {} } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!priceId) {
     return new NextResponse(JSON.stringify({ error: 'Missing priceId' }), { status: 400 });
  }

  try {
    // Optional: Check if user already has a Stripe customer ID in your DB
    // let customerId = user.stripe_customer_id; // Assuming you store this
    // if (!customerId) {
    //    const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
    //    customerId = customer.id;
    //    // TODO: Save customerId to your Supabase user profile
    // }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      // customer: customerId, // Use existing customer if available
      customer_email: userId, // Clerk will handle email association
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      mode: 'subscription', // or 'payment'
      allow_promotion_codes: true,
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancelled`,
      metadata: {
        ...metadata,
        userId: userId, // Crucial for linking payment to user in webhooks
      },
    });

    if (!session.id) {
         throw new Error("Could not create Stripe session");
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return new NextResponse(JSON.stringify({ error: { message: err.message } }), { status: 500 });
  }
}
