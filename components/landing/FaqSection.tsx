"use client";

import * as React from "react";
import { PhoneCall } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  description?: string;
  items?: FAQItem[];
  contactInfo?: {
    title?: string;
    description?: string;
    buttonText?: string;
    onContact?: () => void;
  };
}

// Define default FAQ items relevant to Lullaby.ai
const DEFAULT_LULLABY_FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does Lullaby.ai create personalized stories?",
    answer: "Lullaby.ai uses advanced AI to analyze the family photos you upload. It identifies elements, characters, and themes in the images and weaves them into a unique bedtime story based on your chosen settings (theme, length, characters).",
    category: "AI & Story Generation",
  },
  {
    question: "Can I really use my own voice for narration?",
    answer: "Yes! Our Premium and Premium+ plans allow you to create custom voice profiles by recording a sample of your voice. The AI then uses this profile to narrate the stories, making them truly personal.",
    category: "Voice Narration",
  },
  {
    question: "What languages are supported?",
    answer: "Currently, Lullaby.ai supports story generation and narration in English, French, Japanese, and Indonesian. We are always working to add more languages!",
    category: "Features",
  },
  {
    question: "How many photos can I use for one story?",
    answer: "You can upload up to 5 photos per story. The AI will incorporate elements from these images to create a richer, more personalized narrative.",
    category: "Story Creation",
  },
  {
    question: "What's the difference between the subscription tiers?",
    answer: "Our Free tier offers basic features with limits. Premium unlocks more stories per month, premium voices, background music, and custom voice profiles. Premium+ offers the highest story limit and more voice profile slots. Check our Pricing section for full details.",
    category: "Subscription & Billing",
  },
  {
    question: "Is my data and uploaded photos secure?",
    answer: "Absolutely. We prioritize your privacy and security. Photos are processed securely and used solely for story generation. Please refer to our Privacy Policy for detailed information.",
    category: "Security & Privacy",
  },
];

export function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Your Questions Answered",
  description = "Find answers to common questions about Lullaby.ai, from story creation and voice options to subscription details and security.",
  items = DEFAULT_LULLABY_FAQ_ITEMS, // Use Lullaby specific defaults
  contactInfo = {
    title: "Still have questions?",
    buttonText: "Contact Support",
    onContact: () => console.log("Contact support clicked"), // Replace with actual contact logic
  },
  className,
  ...props
}: FAQSectionProps) {
  return (
    <div className={cn("w-full py-16 lg:py-24 bg-background", className)} {...props}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left Column: Title, Description, Contact */}
          <div className="flex flex-col gap-6 lg:gap-8 sticky top-24">
            <div className="flex flex-col gap-3">
              <Badge variant="outline" className="w-fit">{subtitle}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {title}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            <div className="mt-4 p-6 border rounded-lg bg-transparent">
              <h3 className="text-lg font-semibold mb-2">{contactInfo.title}</h3>
              <Button className="w-full gap-2" variant="default" onClick={contactInfo.onContact}>
                {contactInfo.buttonText} <PhoneCall className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:mt-0">
            <Accordion type="single" collapsible className="w-full space-y-4 ">
              {items.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden bg-transparent">
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                    <div className="flex flex-col items-start gap-1">
                      {item.category && (
                        <Badge variant="secondary" className="text-xs font-medium  mb-1">
                          {item.category}
                        </Badge>
                      )}
                      <span className="text-base font-semibold">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-0">
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the main component directly
export default FAQSection;
  