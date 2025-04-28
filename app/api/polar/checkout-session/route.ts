// app/api/polar/checkout-session/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';
import { Checkout } from '@polar-sh/nextjs'


const polar = new Polar({
    accessToken: process.env.POLAR_API_KEY!,
    server: 'sandbox',
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized: User not found' }), { status: 401 });
  }

  const { products } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!products || !products.length) {
     return new NextResponse(JSON.stringify({ error: 'Missing products in request body' }), { status: 400 });
  }

  try {
    const checkout = await polar.checkouts.create({
        products,
    });

    // if (!checkoutSession.url) {
    //   throw new Error("Could not create Polar checkout session");
    // }

    return NextResponse.json({ checkoutUrl: checkout.url });

  } catch (err: any) {
    console.error('Error creating Polar checkout session:', err);
    return new NextResponse(JSON.stringify({ error: { message: err.message } }), { status: 500 });
  }
}