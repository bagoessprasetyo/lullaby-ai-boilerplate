"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"
import { useUserStories } from "@/hooks/use-all-stories"
import LibraryEmptyState from "@/components/ui/EmptyLibraryState"
import { Button } from "@/components/ui/button"
import { Heart, Play, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const { user } = useUser()
  const { data: stories, isLoading } = useUserStories(user?.id)
  const [searchTerm, setSearchTerm] = useState("")

  // Group stories by theme
  const groupedStories = stories?.reduce((acc: { [key: string]: any[] }, story: any) => {
    const theme = story.theme || 'Uncategorized' // Handle stories without a theme
    if (!acc[theme]) {
      acc[theme] = []
    }
    // Apply search filter within grouping
    if (story.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      acc[theme].push(story)
    }
    return acc
  }, {})

  const themesInOrder = groupedStories ? Object.keys(groupedStories).sort() : []

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 w-full mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Story Library</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full bg-background/60 border-muted focus-visible:ring-offset-0"
            />
          </div>
          <Button asChild className="gap-2 md:self-end">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              <span>Create Story</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, themeIndex) => (
            <div key={themeIndex}>
              <div className="h-8 w-1/4 bg-muted/50 animate-pulse rounded mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, storyIndex) => (
                  <div key={storyIndex} className="w-full">
                    <div className="h-72 rounded-xl shadow-sm bg-muted/50 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!stories || stories.length === 0) && <LibraryEmptyState />}

      {/* Content - Stories Grouped by Theme */}
      {!isLoading && groupedStories && themesInOrder.length > 0 && (
        <div className="space-y-12">
          {themesInOrder.map((theme) => (
            groupedStories[theme].length > 0 && (
              <div key={theme} className="space-y-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold capitalize text-foreground">
                    {theme} Stories
                  </h2>
                  <div className="h-px flex-1 bg-border/60" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {groupedStories[theme].map((story: any) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && themesInOrder.length > 0 && Object.values(groupedStories || {}).every(arr => arr.length === 0) && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-medium text-foreground mb-2">No stories found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any stories matching "{searchTerm}". Try a different search term or browse all stories.
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => setSearchTerm("")}
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    duration: number;
    play_count: number;
    images?: { storage_path: string }[];
  }
}

function StoryCard({ story }: StoryCardProps) {
  const hasImage = story.images?.[0]?.storage_path;
  
  return (
    <Link href={`/library/${story.id}`} className="block w-full group">
      <div
        className={cn(
          "relative w-full h-72 rounded-xl overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur-sm",
          "border border-border/40 shadow-sm",
          "group-hover:shadow-md group-hover:border-border/80 group-hover:scale-[1.02]",
          "group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2"
        )}
      >
        {/* Background Image or Gradient */}
        {hasImage ? (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundImage: `url("${story.images?.[0]?.storage_path || ''}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm 
                    opacity-0 group-hover:opacity-100 transition-all duration-300 
                    hover:bg-background hover:scale-110 shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add to favorites', story.id);
          }}
          aria-label="Add to favorites"
        >
          <Heart className="h-4 w-4 text-muted-foreground hover:text-rose-500 transition-colors" />
        </button>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <button
            className="bg-primary/90 hover:bg-primary p-3.5 rounded-full shadow-md 
                      transform scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 
                      transition-all duration-300 hover:scale-110"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Play story', story.id);
            }}
            aria-label="Play story"
          >
            <Play className="h-5 w-5 text-primary-foreground fill-current" />
          </button>
        </div>

        {/* Story Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="font-medium text-lg text-white truncate mb-1 group-hover:text-primary-foreground transition-colors">
            {story.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-200">
            <span className="flex items-center gap-1">
              <span>{Math.floor(story.duration / 60)} min</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-gray-400/70" />
            <span className="flex items-center gap-1">
              <span>{story.play_count} plays</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}