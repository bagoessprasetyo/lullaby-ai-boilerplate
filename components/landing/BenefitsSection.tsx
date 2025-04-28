"use client";

import React from "react";
import { Check, Zap, Shield, Clock, Sparkles, Gem, BookOpen, Mic, Languages, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming utils path

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      className="flex flex-row gap-4 items-start"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-muted-foreground text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

interface BenefitsSectionProps {
  badge?: string;
  title?: string;
  description?: string;
  benefits?: BenefitItemProps[];
  className?: string;
}

// Define Lullaby.ai specific benefits
const lullabyBenefits: BenefitItemProps[] = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Personalized AI Stories",
    description: "Turn your family photos into unique, magical bedtime tales."
  },
  {
    icon: <Mic className="w-5 h-5" />,
    title: "Engaging Voice Narration",
    description: "Choose from various AI voices or even use your own recorded voice."
  },
  {
    icon: <Languages className="w-5 h-5" />,
    title: "Multi-Language Support",
    description: "Generate stories and narration in English, French, Japanese, or Indonesian."
  },
  {
    icon: <Music className="w-5 h-5" />,
    title: "Soothing Background Music",
    description: "Enhance the atmosphere with calming, magical background tracks."
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Customizable Experience",
    description: "Tailor characters, themes, and story length to your child's preferences."
  },
  {
    icon: <Check className="w-5 h-5" />,
    title: "Easy Media Management",
    description: "Organize, favorite, and easily find all your created stories."
  }
];

export function BenefitsSection({
  badge = "Why Lullaby.ai?",
  title = "Create Unforgettable Bedtime Moments",
  description = "Discover the unique features that make Lullaby.ai the perfect storytelling companion for your family.",
  benefits = lullabyBenefits,
  className
}: BenefitsSectionProps) {
  return (
    <div className={cn("w-full py-16 lg:py-24 bg-gradient-to-b from-white via-purple-50 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">{badge}</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tight font-bold max-w-3xl mb-4 text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="text-lg max-w-2xl leading-relaxed tracking-tight text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </motion.div>

        {/* Removed Card wrapper for a cleaner look, benefits directly in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the main component directly
export default BenefitsSection;
