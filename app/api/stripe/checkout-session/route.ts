import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server'; // Use server client
import { stripe } from '@/lib/stripe/server'; // Use server-side Stripe instance
import { getURL } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient();

  try {
    const { priceId } = await req.json();

    // 1. Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError?.message);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // 2. Retrieve or create Stripe customer
    let customerId: string | undefined;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found
      console.error('Error fetching profile:', profileError.message);
      return NextResponse.json({ error: 'Could not fetch user profile' }, { status: 500 });
    }

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUUID: user.id,
        },
      });
      customerId = customer.id;

      // Update Supabase profile with the new customer ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile with Stripe customer ID:', updateError.message);
        // Continue, but log the error. Checkout can proceed.
      }
    }

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Assuming subscription model
      customer: customerId,
      success_url: `${getURL()}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getURL()}/pricing`, // Redirect back to pricing page on cancel
      metadata: {
        supabaseUUID: user.id, // Include Supabase user ID in metadata
        priceId: priceId,
      },
    });

    if (!session.id) {
        throw new Error('Could not create Stripe checkout session.');
    }

    // 4. Return session ID
    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe Checkout Session Error:', error.message);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}