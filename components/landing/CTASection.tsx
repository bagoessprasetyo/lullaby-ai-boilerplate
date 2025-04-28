// components/landing/CTASection.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  secondaryButtonAction?: () => void;
  className?: string;
  "aria-label"?: string; // Add aria-label prop
}

export default function CTASection({
  title = "Ready to Create Magical Moments?",
  description = "Turn your cherished photos into unforgettable AI-powered bedtime stories. Start your free trial today and bring your family's memories to life.",
  primaryButtonText,
  primaryButtonUrl,
  primaryButtonAction,
  secondaryButtonText = "Learn More",
  secondaryButtonUrl = "#how-it-works", // Link to How It Works section or relevant page
  secondaryButtonAction,
  className,
  "aria-label": ariaLabel,
}: CTASectionProps) {
  const { user } = useUser();

  // Determine default primary button text and URL based on user auth state
  const defaultPrimaryText = user ? "Create Your Next Story" : "Start Your Free Trial";
  const defaultPrimaryUrl = user ? "/create" : "/auth/sign-up"; // Redirect to create page if logged in, else sign-up

  return (
    <section 
      className={cn("py-16 lg:py-24 bg-gradient-to-b from-white via-pink-50 to-purple-50 dark:from-background dark:via-purple-900/10 dark:to-gray-900", className)}
      aria-label={ariaLabel || "Call to action section"} // Use provided or default aria-label
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex w-full flex-col gap-8 overflow-hidden rounded-xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 p-8 shadow-lg md:rounded-2xl lg:flex-row lg:items-center lg:p-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-4xl lg:mb-6">
              {title}
            </h2>
            <p className="text-purple-100 dark:text-purple-200 lg:text-lg">{description}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row lg:ml-8 justify-center lg:justify-start">
            {secondaryButtonText && (secondaryButtonUrl || secondaryButtonAction) && (
              <Button 
                variant="outline"
                size="lg"
                className="bg-white/20 text-white border-white/50 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                onClick={secondaryButtonAction}
                asChild={!!secondaryButtonUrl && !secondaryButtonAction}
              >
                {secondaryButtonUrl && !secondaryButtonAction ? (
                  <Link href={secondaryButtonUrl}>{secondaryButtonText}</Link>
                ) : (
                  <span>{secondaryButtonText}</span>
                )}
              </Button>
            )}
            {(primaryButtonText || defaultPrimaryText) && (primaryButtonUrl || defaultPrimaryUrl || primaryButtonAction) && (
              <Button 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 group transform hover:-translate-y-1"
                onClick={primaryButtonAction}
                asChild={!!(primaryButtonUrl || defaultPrimaryUrl) && !primaryButtonAction}
              >
                {(primaryButtonUrl || defaultPrimaryUrl) && !primaryButtonAction ? (
                  <Link href={primaryButtonUrl || defaultPrimaryUrl}>
                    {primaryButtonText || defaultPrimaryText}
                    <Sparkles className="ml-2 h-5 w-5 group-hover:animate-sparkle transition-transform" />
                  </Link>
                ) : (
                  <>
                    {primaryButtonText || defaultPrimaryText}
                    <Sparkles className="ml-2 h-5 w-5 group-hover:animate-sparkle transition-transform" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
