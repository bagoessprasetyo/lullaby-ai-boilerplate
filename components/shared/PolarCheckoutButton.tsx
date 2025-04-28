/* eslint-disable @typescript-eslint/no-explicit-any */
// components/shared/PolarCheckoutButton.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PolarCheckoutButtonProps {
  productId: string;
  buttonText?: string;
}

export function PolarCheckoutButton({ productId, buttonText = "Subscribe" }: PolarCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/polar/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: [productId] 
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;

    } catch (error: any) {
      console.error('Polar checkout error:', error);
      toast({
          title: "Checkout Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full">
      {loading ? 'Processing...' : buttonText}
    </Button>
  );
}