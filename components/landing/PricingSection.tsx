"use client"

import * as React from "react"
import { BadgeCheck, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckoutButton } from "@/components/shared/CheckoutButton"; // Import CheckoutButton

export interface PricingTier {
  id?: string;
  name: string;
  price: Record<string, number | string>;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  popular?: boolean;
  productId?: string;
  priceId?: Record<string, string>; // Add priceId for Stripe
}

interface PricingCardProps {
  tier: PricingTier;
  paymentFrequency: string;
}

export function PricingCard({ tier, paymentFrequency }: PricingCardProps) {
  const price = tier.price[paymentFrequency];
  const isHighlighted = tier.highlighted;
  const isPopular = tier.popular;
  const stripePriceId = tier.priceId?.[paymentFrequency]; // Get the price ID for the selected frequency

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-8 overflow-hidden p-6",
        isHighlighted
          ? "bg-foreground text-background"
          : "bg-background text-foreground",
        isPopular && "ring-2 ring-primary"
      )}
    >
      {isHighlighted && <HighlightedBackground />}
      {isPopular && <PopularBackground />}

      <h2 className="flex items-center gap-3 text-xl font-medium capitalize">
        {tier.name}
        {isPopular && (
          <Badge variant="secondary" className="mt-1 z-10">
            🔥 Most Popular
          </Badge>
        )}
      </h2>

      <div className="relative h-12">
        {typeof price === "number" ? (
          <>
            <NumberFlow
              format={{
                style: "currency",
                currency: "USD",
                trailingZeroDisplay: "stripIfInteger",
              }}
              value={price}
              className="text-4xl font-medium"
            />
            <p className="-mt-2 text-xs text-muted-foreground">
              Per {paymentFrequency === "yearly" ? "year" : "month"}/user
            </p>
          </>
        ) : (
          <h1 className="text-4xl font-medium">{price}</h1>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-medium">{tier.description}</h3>
        <ul className="space-y-2">
          {tier.features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isHighlighted ? "text-background" : "text-muted-foreground"
              )}
            >
              <BadgeCheck className="h-4 w-4" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Conditionally render CheckoutButton or standard Button */}
      {tier.id === 'free' ? (
        <Button
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
          // Add onClick handler for free tier if needed, e.g., redirect to signup
        >
          {tier.cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : stripePriceId ? (
        <CheckoutButton
          priceId={stripePriceId}
          buttonText={tier.cta}
        />
      ) : (
        <Button
          variant={isHighlighted ? "secondary" : "default"}
          className="w-full"
          disabled // Disable if priceId is missing
        >
          {tier.cta} (Coming Soon)
        </Button>
      )}
    </Card>
  );
}

const HighlightedBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
);

const PopularBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
);

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
  discount?: boolean;
}

export function Tab({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-4 py-2 text-sm font-semibold capitalize",
        "text-foreground transition-colors",
        discount && "flex items-center justify-center gap-2.5"
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: "spring", duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-full bg-background shadow-sm"
        />
      )}
      {discount && (
        <Badge
          variant="secondary"
          className={cn(
            "relative z-10 whitespace-nowrap shadow-none",
            selected && "bg-muted"
          )}
        >
          Save 35%
        </Badge>
      )}
    </button>
  );
}

interface PricingSectionProps {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
  frequencies?: string[];
}

export function PricingSection({
  title = "Choose Your Lullaby Plan", // Updated Title
  subtitle = "Unlock magical bedtime stories tailored for your family.", // Updated Subtitle
  tiers,
  frequencies = ["monthly", "yearly"],
}: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0]);

  return (
    <section className="flex flex-col items-center gap-10 py-16 lg:py-24 bg-background">
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-muted p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === "yearly"} // Keep discount logic for yearly if applicable
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 grid w-full max-w-6xl gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
          />
        ))}
      </div>
    </section>
  );
}

// Define Lullaby.ai specific tiers with placeholder Stripe Price IDs
export const LULLABY_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "Start creating magical moments",
    features: [
      "2 stories per month",
      "Basic AI voices",
      "Short & Medium story length",
      "Standard themes",
    ],
    cta: "Get Started for Free",
    productId: "free", // Set the productId for the Free tier
    // No priceId needed for free tier
  },
  {
    id: "premium",
    name: "Premium",
    price: {
      monthly: 15, // Example price, adjust as needed
      yearly: 150, // Example price, adjust as needed
    },
    description: "Unlock more creativity & features",
    features: [
      "20 stories per month",
      "All story lengths (Short, Medium, Long)",
      "Premium AI voices",
      // "Background music options",
      "Advanced story themes",
    ],
    cta: "Go Premium",
    popular: true, // Mark Premium as popular
    productId: "premium", // Set the productId for the Premium tier
    priceId: {
      monthly: "prod_SDIqoAq06lVnhR", // Replace with actual Stripe Price ID
      yearly: "prod_SDIqv97or1eBiy", // Replace with actual Stripe Price ID
    },
  },
  {
    id: "premium-plus",
    name: "Premium+",
    price: {
      monthly: 25, // Example price, adjust as needed
      yearly: 250, // Example price, adjust as needed
    },
    description: "For the ultimate storytelling experience",
    features: [
      "30 stories per month",
      "Everything in Premium",
      "Up to 1 Custom voice profiles",
      "Priority support",
    ],
    cta: "Choose Premium+",
    highlighted: false, // Decide if this should be highlighted
    productId: "premium-plus", // Set the productId for the Premium+ tier
    priceId: {
      monthly: "price_1Pj9zzzzzzzzzzzzzzzzzzzzzz", // Replace with actual Stripe Price ID
      yearly: "price_1Pj9aaaaaaaaaaaaaaaaaaaaaa", // Replace with actual Stripe Price ID
    },
  },
];

// Default export using the Lullaby tiers
export default function PricingSectionWrapper() {
  return (
    <PricingSection tiers={LULLABY_TIERS} />
  );
}
