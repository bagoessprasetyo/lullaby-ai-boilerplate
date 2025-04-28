// components/landing/FeaturesSection.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  MicVocal, 
  Languages, 
  Music, 
  Library 
} from "lucide-react"; // Adjusted icons based on original file
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

// Use the features defined in the original Lullaby.ai context
const features: FeatureCardProps[] = [
  {
    title: "Personalized AI Stories",
    description: "Transform up to 5 photos into unique tales starring your child and loved ones.",
    icon: <Sparkles className="w-8 h-8 stroke-1" />,
    className: "col-span-1 md:col-span-4 lg:col-span-4 border-b md:border-r dark:border-neutral-800"
  },
  {
    title: "Enchanting Narration",
    description: "Choose from warm AI voices or record your own for a truly personal touch.",
    icon: <MicVocal className="w-8 h-8 stroke-1" />,
    className: "col-span-1 md:col-span-2 lg:col-span-2 border-b dark:border-neutral-800"
  },
  {
    title: "Global Tales",
    description: "Enjoy stories and narration in English, French, Japanese, or Indonesian.",
    icon: <Languages className="w-8 h-8 stroke-1" />,
    className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800"
  },
  {
    title: "Soothing Background Music",
    description: "Add calming, magical, or playful tunes to enhance the listening experience.",
    icon: <Music className="w-8 h-8 stroke-1" />,
    className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none"
  },
  {
    title: "Your Story Library",
    description: "Easily browse, search, and favorite all the magical stories you create.",
    icon: <Library className="w-8 h-8 stroke-1" />,
    className: "col-span-1 md:col-span-6 lg:col-span-6 md:border-none"
  }
];

function FeatureCard({ title, description, icon, className }: FeatureCardProps) {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-300 inline-block">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold tracking-tight mt-2 text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-muted-foreground max-w-xs text-base mt-2 text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                Key Features
              </Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-bold text-left text-gray-900 dark:text-gray-100">
                Everything You Need to Create Magic
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left text-gray-600 dark:text-gray-400">
                Lullaby.ai combines powerful AI with intuitive controls to make personalized storytelling effortless and fun.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 border rounded-lg dark:border-neutral-800 shadow-sm">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className={feature.className}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
