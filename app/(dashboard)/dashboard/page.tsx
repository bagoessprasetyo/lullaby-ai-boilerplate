"use client"

console.log('[Dashboard Page] Rendering started.'); // Add log to check if dashboard page renders

import * as React from "react"; // Import React and useState
import { BentoGrid, BentoItem } from "@/components/ui/bento-grid"
import { BadgeCheckIcon, BookOpenIcon, HeadphonesIcon, Sparkles, PlayIcon, HeartIcon, SearchIcon } from "lucide-react" // Add SearchIcon
import { useMostPlayedStories } from '@/hooks/use-most-played-stories';
// import { auth } from "@clerk/nextjs/server" // Remove unused server import
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { StoryCard } from "@/components/ui/story-card"; // Import the new StoryCard component
import { Input } from "@/components/ui/input"; // Import Input component
// import { useTheme } from "next-themes";
import { FloatingPlayerStory } from '@/components/ui/floating-story-player'; // Import the story type for the player

// Define the props for the page, including the passed-down handler
interface DashboardPageProps {
  handlePlayStory?: (story: FloatingPlayerStory) => void;
}

export default function Page({ handlePlayStory }: DashboardPageProps) {
  console.log('[Dashboard Page] Inside component function.'); // Add log inside the function
  const { user } = useUser();
  const { data: mostPlayedStories, isLoading: isLoadingStories } = useMostPlayedStories(user?.id);
  const [searchTerm, setSearchTerm] = React.useState(""); // State for search term
  // console.log('usrrrr : '+ user?.publicMetadata);
  // const { theme } = useTheme();

  // --- Define Bento Grid Items --- 
  const bentoItems: BentoItem[] = [
    // Stat Cards
    {
      title: "Stories Created",
      description: <><p className="text-2xl font-bold">12</p><p className="text-xs text-muted-foreground">+2 from last month</p></>,
      icon: <BookOpenIcon className="h-4 w-4 text-blue-500" />,
      className: "md:col-span-1 bg-blue-50 dark:bg-blue-900/30", // Added background color
    },
    {
      title: "Listening Time",
      description: <><p className="text-2xl font-bold">45m</p><p className="text-xs text-muted-foreground">+10m from last week</p></>,
      icon: <HeadphonesIcon className="h-4 w-4 text-green-500" />,
      className: "md:col-span-1 bg-green-50 dark:bg-green-900/30", // Added background color
    },
    {
      title: "Subscription",
      description: <><p className="text-2xl font-bold">Premium</p><p className="text-xs text-muted-foreground">Renews in 15 days</p></>,
      icon: <BadgeCheckIcon className="h-4 w-4 text-purple-500" />,
      className: "md:col-span-1 bg-purple-50 dark:bg-purple-900/30", // Added background color
    },
    // Top Played Stories (Placeholder or first few)
    ...(isLoadingStories
      ? Array.from({ length: 3 }).map((_, index) => ({
          title: "Loading Story...",
          description: <Skeleton className="h-10 w-full" />,
          icon: <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />,
          className: "md:col-span-1",
          background: <Skeleton className="absolute inset-0 h-full w-full" />,
        }))
      : mostPlayedStories?.slice(0, 3).map((story) => ({
          title: story.title,
          description: `Duration: ${Math.floor(story.duration / 60)}m | Plays: ${story.play_count}`,
          icon: <PlayIcon className="h-4 w-4 text-red-500" />,
          className: "md:col-span-1 group/story relative bg-gray-50 dark:bg-gray-800/30", // Add group for story interactions and background color
          cta: "Play Now",
          background: (
            <>
              {story.images?.[0]?.storage_path && (
                <Image
                  src={story.images[0].storage_path}
                  alt={story.title}
                  fill
                  className="object-cover absolute inset-0 z-0 opacity-20 group-hover/story:opacity-40 transition-opacity"
                />
              )}
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover/story:opacity-60 transition-opacity duration-300 z-0" />
              {/* Buttons on hover */}
              <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover/story:opacity-100 transition-opacity">
                <button
                  className="bg-white/80 hover:bg-white p-3 rounded-full shadow-md mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Play story from Bento:', story.id);
                    if (handlePlayStory && story.audio_url) { // Check if audio_url exists
                      handlePlayStory({
                        id: story.id,
                        title: story.title,
                        audio_url: story.audio_url, // Use the existing audio_url
                        imageUrl: story.images?.[0]?.storage_path,
                        duration: story.duration,
                      });
                    } else {
                      console.warn('Cannot play story: audio_url missing or handlePlayStory not provided.');
                    }
                  }}
                >
                  <PlayIcon className="h-5 w-5 text-black" />
                </button>
                <button
                  className="bg-white/80 hover:bg-white p-3 rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Add to favorites', story.id);
                  }}
                >
                  <HeartIcon className="h-5 w-5 text-pink-600" />
                </button>
              </div>
            </>
          ),
          // Make text visible on hover
          hasPersistentHover: false, // Let the background handle hover state
        })) || []), // Ensure audio_url is included if needed by FloatingPlayerStory
  ];
  // --- End Define Bento Grid Items ---

  // Filter stories based on search term
  const filteredStories = React.useMemo(() => {
    if (!mostPlayedStories) return [];
    if (!searchTerm) return mostPlayedStories;
    return mostPlayedStories.filter(story => 
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mostPlayedStories, searchTerm]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h2 className="text-lg font-semibold">Dashboard Overview</h2>
        <BentoGrid items={bentoItems} className="md:grid-cols-3" />

        {/* Optional: Keep a separate section for ALL stories if needed */}
         <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">All Stories</h2>
            <div className="relative w-full max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search stories..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingStories && Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="max-w-xs w-full">
                <Skeleton className="h-96 rounded-md shadow-xl mx-auto" />
              </div>
            ))}
            {!isLoadingStories && filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                image={story.images?.[0]?.storage_path || '/placeholder-image.png'} // Provide a fallback image
                title={story.title}
                duration={story.duration} // Pass duration directly
                playCount={story.play_count}
                className="bg-purple-50 dark:bg-purple-900/30" // Apply new background color
                // Add onPlay and onFavorite handlers if needed
                onPlay={() => {
                  console.log('Play story from Card:', story);
                  if (handlePlayStory && story.audio_url) { // Use story.audio_url
                    handlePlayStory({
                      id: story.id,
                      title: story.title,
                      audio_url: story.audio_url, // Use story.audio_url
                      imageUrl: story.images?.[0]?.storage_path,
                      duration: story.duration,
                    });
                  } else {
                    console.warn('Cannot play story: audio_url missing or handlePlayStory not provided.');
                  }
                }}
                onFavorite={() => console.log('Favorite story:', story.id)}
              />
            ))}
            {!isLoadingStories && filteredStories.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">No stories found matching your search.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
