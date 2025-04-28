/* eslint-disable @typescript-eslint/no-explicit-any */
// components/shared/CheckoutButton.tsx
'use client';

import React, { useState } from 'react';
import { getStripe } from '@/lib/stripe/client';
import { Button } from '@/components/ui/button'; // From shadcn/ui
import { useToast } from '@/hooks/use-toast';
// import { useToast } from "@/components/ui/use-toast"; // For showing errors

interface CheckoutButtonProps {
  priceId: string;
  // Add other props like quantity, metadata if needed
  buttonText?: string;
}

export function CheckoutButton({ priceId, buttonText = "Subscribe" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: priceId /*, quantity, metadata */ }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();

      if (!stripe) {
         throw new Error('Stripe.js has not loaded yet.');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe redirect error:', error.message);
        throw new Error(`Redirect failed: ${error.message}`);
      }
      // Redirect happens here, setLoading(false) might not be reached if successful

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
          title: "Checkout Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
      });
      setLoading(false); // Ensure loading is reset on error
    }
    // No finally block needed here as successful redirect navigates away
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
}
