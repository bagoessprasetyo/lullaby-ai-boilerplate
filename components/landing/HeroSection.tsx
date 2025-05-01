// components/landing/HeroSection.tsx
// import Image from 'next/image';
"use client"
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, House, PanelsTopLeft, Sparkles } from 'lucide-react';
import NewAudioPlayer from '../ui/NewAudioPlayer';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/clerk-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ID, US } from 'country-flag-icons/react/3x2'
// import { AudioPlayer } from '@/components/ui/audio-player'; // <-- Import the new component

export default function HeroSection() {
  const router = useRouter();
  const { user } = useUser();
  const audioSrc = "https://res.cloudinary.com/dcx38wpwa/video/upload/v1742185189/story-app-audio/60bd34fb-e13d-4c24-bd3e-1f5a13454c4d-audio.mp3"; // Define the source URL

  return (
    <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/10 dark:to-background animate-fade-in">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 dark:text-gray-100">
              Turn Cherished Photos into Magical AI Bedtime Stories
            </h1>
            <p className="max-w-[600px] text-gray-600 dark:text-gray-400 md:text-xl lg:mx-0 mx-auto">
              Create personalized, narrated adventures featuring your child,
              loved ones, and favorite moments. Bring your photos to life with
              Lullaby.ai.
            </p>
            {/* Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                onClick={() => router.push(user ? '/dashboard' : '/coming-soon')}
              >
                {user ? (
                  <>
                    Start the Magic Now!
                    <Sparkles className="ml-2 h-5 w-5 group-hover:animate-sparkle transition-transform" />
                  </>
                ) : (
                  'Create Your First Story Free'
                )}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="transition-all duration-300 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Learn More
              </Button>
            </div>

            {/* --- Custom Audio Player --- */}
           
            {/* --- End Custom Audio Player --- */}

          </div>
          <Tabs defaultValue="tab-1">
            <ScrollArea>
              <TabsList className="mb-3 gap-1 bg-transparent">
                <TabsTrigger
                  value="tab-1"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  <US className="-ms-0.5 me-1.5 opacity-60 size-5"/>
                 English
                </TabsTrigger>
                <TabsTrigger
                  value="tab-2"
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  <ID className="-ms-0.5 me-1.5 opacity-60 size-5"/>
                  Indonesia
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <TabsContent value="tab-1">
              <div className="flex justify-start">
                <NewAudioPlayer
                    src={audioSrc}
                    cover='https://res.cloudinary.com/dcx38wpwa/image/upload/v1742185123/story-app-stories/60bd34fb-e13d-4c24-bd3e-1f5a13454c4d-1.jpg'
                    title="Joko and the Sooting Rain"
                    artist="Daddy's Bedtime"
                  />
              </div>
            </TabsContent>
            <TabsContent value="tab-2">
              <div className="flex justify-start">
                <NewAudioPlayer
                    src={audioSrc}
                    cover='https://res.cloudinary.com/dcx38wpwa/image/upload/v1742185123/story-app-stories/60bd34fb-e13d-4c24-bd3e-1f5a13454c4d-1.jpg'
                    title="Joko dan Hujan yang Menenangkan"
                    artist="Daddy's Bedtime"
                  />
              </div>
            </TabsContent>
          </Tabs>
          {/* Visual Content */}
          
        </div>
      </div>
    </section>
  );
}
