"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

interface TestimonialCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  testimonials: Testimonial[];
}

export const TestimonialCarousel = React.forwardRef<HTMLDivElement, TestimonialCarouselProps>(
  ({ className, testimonials, ...props }, ref) => {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
      if (!api) return;
      api.on("select", () => {
        setCurrent(api.selectedScrollSnap());
      });
    }, [api]);

    return (
      <div ref={ref} className={cn("py-16", className)} {...props}>
        <Carousel
          setApi={setApi}
          className="max-w-screen-xl mx-auto px-4 lg:px-8"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={index}
                className="flex flex-col items-center cursor-grab"
              >
                <p className="max-w-xl text-balance text-center text-xl sm:text-2xl text-foreground mb-8">
                  \"{testimonial.quote}\"
                </p>
                <div className="mt-5 relative size-16 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h5 className="mt-5 font-medium text-foreground">
                  {testimonial.name}
                </h5>
                <h5 className="mt-1.5 font-medium text-muted-foreground">
                  {testimonial.designation}
                </h5>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  index === current ? "bg-primary" : "bg-primary/35"
                )}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

TestimonialCarousel.displayName = "TestimonialCarousel";

// Need to import useState for AnimatedTestimonials
import { useState } from 'react';

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  React.useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]); // Added handleNext to dependency array

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className={cn("max-w-sm md:max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-20", className)}>
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <div className="relative h-80 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src} // Use a unique key like src
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <Image
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active} // Key change triggers animation
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold text-foreground">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {testimonials[active].designation}
            </p>
            <motion.p className="text-lg text-muted-foreground mt-8">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
            >
              <ArrowLeft className="h-5 w-5 text-foreground group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center group/button"
            >
              <ArrowRight className="h-5 w-5 text-foreground group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define the main TestimonialSection component
function TestimonialSection() {
  // Sample testimonials - replace with actual data source if needed
  const testimonials: Testimonial[] = [
    {
      quote:
        "Lullaby.ai turned our family photos into the most magical bedtime stories! My daughter asks for her 'photo story' every night.",
      name: "Jessica M.",
      designation: "Mom of Two",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder image
    },
    {
      quote:
        "Recording my own voice for the narration was surprisingly easy and made the stories feel so much more personal. A fantastic app!",
      name: "David R.",
      designation: "Dad & Storyteller",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder image
    },
    {
      quote:
        "The different themes and music options keep things fresh. We love exploring adventures one night and calming tales the next.",
      name: "Aisha K.",
      designation: "Parent & Educator",
      src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder image
    },
    {
      quote:
        "It's amazing how it uses our photos! Seeing familiar faces in the stories makes my son giggle every time. Highly recommend!",
      name: "Kenji T.",
      designation: "Happy Father",
      src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder image
    },
    {
      quote:
        "The multi-language feature is perfect for our bilingual family. The kids are enjoying stories in both English and French!",
      name: "Chloé Dubois",
      designation: "Multilingual Mom",
      src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Placeholder image
    },
  ];

  return (
    <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-pink-50 to-white dark:from-purple-900/10 dark:to-gray-950">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
           <div className="inline-block rounded-lg bg-pink-100 dark:bg-pink-900/50 px-3 py-1 text-sm text-pink-700 dark:text-pink-300 mb-4">
              Loved by Families
            </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-gray-900 dark:text-gray-100">
            Hear From Our Happy Storytellers
          </h2>
          <p className="text-gray-600 dark:text-gray-400 md:text-xl mt-4 max-w-3xl mx-auto">
            See how Lullaby.ai is creating magical bedtime moments for families just like yours.
          </p>
        </div>
        
        {/* Use AnimatedTestimonials for larger screens */} 
        <div className="hidden md:block">
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
        
        {/* Use TestimonialCarousel for smaller screens */}
        <div className="md:hidden">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;