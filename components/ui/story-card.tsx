import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Play, Clock, User } from "lucide-react";
import Image from "next/image"; // Import Next Image

interface StoryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  title: string;
  duration: number; // Changed to number for easier formatting
  playCount: number;
  isFavorite?: boolean;
  onPlay?: () => void;
  onFavorite?: () => void;
}

const StoryCard = React.forwardRef<HTMLDivElement, StoryCardProps>(
  ({ 
    className, 
    image, 
    title, 
    duration, 
    playCount, 
    isFavorite = false, 
    onPlay, 
    onFavorite, 
    ...props 
  }, ref) => {
    const [favorite, setFavorite] = React.useState(isFavorite);

    const handleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when clicking favorite
      setFavorite(!favorite);
      if (onFavorite) onFavorite();
    };

    const handlePlay = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click when clicking play
      if (onPlay) onPlay();
    };

    // Format duration (assuming seconds)
    const formatDuration = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
      <Card 
        ref={ref} 
        className={cn("overflow-hidden group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1", className)} 
        {...props}
        onClick={handlePlay} // Make the whole card clickable for play
      >
        <div className="relative h-48 w-full"> {/* Fixed height for image container */} 
          <Image 
            src={image} 
            alt={title} 
            fill // Use fill for responsive image sizing
            className="object-cover transition-transform duration-300 group-hover:scale-105" // Added hover effect
          />
          {/* Play button visible on hover */}
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-3 right-3 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handlePlay}
          >
            <Play className="h-5 w-5 text-foreground" />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="text-md font-semibold mb-2 text-foreground truncate">{title}</h3> {/* Adjusted size and added truncate */} 
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3"> {/* Adjusted spacing */} 
              <div className="flex items-center text-xs text-muted-foreground"> {/* Adjusted size */} 
                <Clock className="mr-1 h-3 w-3" /> {/* Adjusted size */} 
                <span>{formatDuration(duration)}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground"> {/* Adjusted size */} 
                <User className="mr-1 h-3 w-3" /> {/* Adjusted size */} 
                <span>{playCount.toLocaleString()}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "hover:bg-transparent p-1 h-auto w-auto", // Adjusted padding and size
                favorite ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={handleFavorite}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} /> {/* Adjusted size */} 
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StoryCard.displayName = "StoryCard";

export { StoryCard }; // Export the component