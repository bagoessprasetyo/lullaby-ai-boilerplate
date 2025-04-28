"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Feature {
  step: string
  title?: string
  content: string
  image: string
}

interface HowItWorksProps {
  features: Feature[]
  className?: string
  title?: string
  autoPlayInterval?: number
  imageHeight?: string
  "aria-label"?: string; // Add aria-label prop
}

function HowItWorks({
  features,
  className,
  title = "How Lullaby.ai Works",
  autoPlayInterval = 5000, // Increased interval for better readability
  imageHeight = "h-[400px]",
}: HowItWorksProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [progress, features.length, autoPlayInterval])

  const handleStepClick = (index: number) => {
    setCurrentFeature(index)
    setProgress(0)
  }

  return (
    <div className={cn("py-16 lg:py-24 bg-white dark:from-background dark:via-gray-900/50 dark:to-purple-900/10", className)}>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-10 md:mb-16 max-w-2xl mx-auto">
          Discover how Lullaby.ai transforms your cherished photos into magical bedtime stories in just a few clicks.
        </p>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Steps List */}
          <div className="order-2 md:order-1">
            <Card className="p-4 md:p-6 border border-border bg-white dark:bg-gray-800/50 shadow-sm">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all",
                    index === currentFeature
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700/30",
                    index !== features.length - 1 && "mb-2"
                  )}
                  onClick={() => handleStepClick(index)}
                >
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-1 transition-colors duration-300",
                      index === currentFeature
                        ? "bg-purple-600 border-purple-600 text-white dark:bg-purple-500 dark:border-purple-500"
                        : index < currentFeature
                        ? "bg-purple-200 border-purple-300 text-purple-700 dark:bg-purple-800/50 dark:border-purple-700 dark:text-purple-300"
                        : "bg-gray-100 border-gray-300 text-gray-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                    )}
                  >
                    {index < currentFeature ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">
                      {feature.title || feature.step}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.content}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Image Display */}
          <div className="order-1 md:order-2 w-full">
            <div className={cn("relative rounded-lg overflow-hidden shadow-lg w-full", imageHeight)}>
              <AnimatePresence mode="wait">
                {features.map(
                  (feature, index) =>
                    index === currentFeature && (
                      <motion.div
                        key={index}
                        className="absolute inset-0 rounded-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Image
                          src={feature.image}
                          alt={feature.title || feature.step}
                          className="w-full h-full object-cover"
                          width={1000}
                          height={600} // Adjusted height for better aspect ratio
                          priority={index === 0} // Prioritize loading the first image
                        />
                        {/* Optional overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </motion.div>
                    ),
                )}
              </AnimatePresence>
            </div>

            {/* Progress Dots/Buttons */}
            <div className="flex justify-center mt-6 gap-2">
              {features.map((_, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  aria-label={`Go to step ${index + 1}`}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full p-0 transition-colors duration-300",
                    index === currentFeature ? "bg-purple-600 dark:bg-purple-500" : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                  )}
                  onClick={() => handleStepClick(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Lullaby.ai specific features
const lullabyFeatures: Feature[] = [
  {
    step: 'Step 1',
    title: 'Upload Your Photos',
    content: 'Select up to 5 cherished photos – family moments, favorite places, or beloved pets.',
    image: '/upload-your-moment.png' // Replace with actual relevant image path
  },
  {
    step: 'Step 2',
    title: 'Customize Your Story',
    content: 'Choose characters, themes (adventure, fantasy, calming), story length, voice style, and background music.',
    image: '/customize.png' // Replace with actual relevant image path
  },
  {
    step: 'Step 3',
    title: 'Generate & Listen',
    content: 'Our AI crafts a unique, narrated story based on your photos and choices. Enjoy the magic!',
    image: '/listen.png' // Replace with actual relevant image path
  },
]

// Export the section component that uses HowItWorks
export default function HowItWorksSection({ "aria-label": ariaLabel }: { "aria-label"?: string }) {
  return (
    <section aria-label={ariaLabel || "How Lullaby.ai works"}>
      <HowItWorks
        features={lullabyFeatures}
        title="Create Magic in 3 Simple Steps"
        autoPlayInterval={6000} // Slightly longer interval for Lullaby
        imageHeight="h-[350px] md:h-[450px]" // Responsive height
      />
    </section>
  )
}
