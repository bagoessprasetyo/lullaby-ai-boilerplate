// "use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { BookOpen, Users, Palette, MapPin, MessageCircle, Bookmark, Calendar } from "lucide-react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { getStoryDetails } from "./service/getStoryDetails";
import StoryContent from "./components/StoryContent";
import DetailItem from "./components/DetailItem";
import CharacterCard from "./components/CharacterCard";
import AudioPlayer from "./components/AudioPlayer";

export default async function StoryDetailPage({ params }: { params: { storyId: string } }) {
  const story = await getStoryDetails(params?.storyId || '');

  if (!story) {
    notFound();
  }

  const formattedDate = new Date(story.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <Card className="overflow-hidden border-border/40 shadow-md bg-background/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0 min-h-[70vh]">
            
            {/* Left Column: Image Carousel & Audio Player */}
            <div className="relative p-6 md:p-8 lg:p-10 border-r border-border/20 flex flex-col bg-muted/5">
              <div className="space-y-6">
                {/* Story Title and Date */}
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground/90 mb-2">
                    {story.title}
                  </h1>
                  <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
                
                <Separator className="opacity-50" />
                
                {/* Image Carousel */}
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {story.images && story.images.length > 0 ? (
                        story.images.map((image, index) => (
                          <CarouselItem key={image.id || index}>
                            <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-border/30 shadow-sm">
                              <Image
                                src={image.storage_path.replace(/`/g, '')}
                                alt={`${story.title} - Image ${index + 1}`}
                                fill
                                className="object-cover transition-all duration-500 hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority={index === 0}
                              />
                            </div>
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem>
                          <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center rounded-lg border border-border/30">
                            <BookOpen className="h-16 w-16 text-primary/30" />
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    {story.images && story.images.length > 1 && (
                      <>
                        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-80" />
                        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 opacity-80" />
                      </>
                    )}
                  </Carousel>
                </div>
              </div>

              {/* Audio Player */}
              {story.audio_url && (
                <div className="pt-8">
                  <AudioPlayer src={story.audio_url.replace(/`/g, '')} title={story.title} />
                </div>
              )}
            </div>

            {/* Right Column: Story Text & Details */}
            <div className="p-6 md:p-8 lg:p-10 flex flex-col bg-background/50">
              {/* Story Content */}
              <div className="mb-6 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-serif font-medium text-foreground/90">Story</h2>
              </div>
              
              <div className="flex-grow overflow-y-auto pr-2 mb-8 scrollbar-thin">
                <div className="prose prose-sm sm:prose max-w-none dark:prose-invert text-foreground/90 font-serif prose-headings:font-serif prose-p:leading-relaxed">
                  <StoryContent text={story.text_content || ''} />
                </div>
              </div>

              {/* Story Details Section */}
              <div className="mt-auto pt-6 border-t border-border/20">
                <h3 className="text-lg font-serif font-medium mb-4 flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Palette className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">Story Details</span>
                </h3>
                
                <div className="space-y-2 mb-6">
                  <DetailItem 
                    icon={<Palette className="h-4 w-4 text-primary/70" />} 
                    label="Theme" 
                    value={story.theme}
                  />
                  <DetailItem 
                    icon={<MapPin className="h-4 w-4 text-primary/70" />} 
                    label="Setting" 
                    value={story.setting || 'N/A'} 
                  />
                  <DetailItem 
                    icon={<MessageCircle className="h-4 w-4 text-primary/70" />} 
                    label="Tone" 
                    value={story.tone || 'N/A'} 
                  />
                </div>
                
                {/* Characters Section */}
                {story.characters && story.characters.length > 0 && (
                  <>
                    <h4 className="text-lg font-serif font-medium mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <span>Characters</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {story.characters.map((char, index) => (
                        <CharacterCard key={index} character={char} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Bookmark indicator */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/30">
          <Bookmark className="h-5 w-5 text-primary/70" />
        </div>
      </div>
    </div>
  );
}

