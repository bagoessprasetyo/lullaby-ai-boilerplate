"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, X, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Define the shape of the story data the player expects
interface Story {
  id: string;
  title: string;
  audio_url: string; // Assuming audio URL is provided
  imageUrl?: string;
  duration: number; // Duration in seconds
}

// Define the props for the player
interface FloatingStoryPlayerProps {
  currentStory: Story | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void; // Optional: for playlists
  onPrevious?: () => void; // Optional: for playlists
  onClose: () => void;
  className?: string;
}

const FloatingStoryPlayer: React.FC<FloatingStoryPlayerProps> = ({
  currentStory,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onClose,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0); // Progress percentage
  const [volume, setVolume] = useState(1); // Volume level (0 to 1)
  const [isMuted, setIsMuted] = useState(false);
  console.log('[FloatingStoryPlayer] Rendering.');
  console.log('[FloatingStoryPlayer] currentStory:', currentStory);
  // Effect to handle audio playback based on isPlaying state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Audio play failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentStory]); // Re-run if isPlaying or the story changes

  // Effect to load new audio source when currentStory changes
  useEffect(() => {
    if (audioRef.current && currentStory) {
      audioRef.current.src = currentStory.audio_url;
      audioRef.current.load(); // Important to load the new source
      setProgress(0); // Reset progress
      if (isPlaying) {
        // Attempt to play immediately if isPlaying was already true
        audioRef.current.play().catch(error => console.error("Audio play failed on story change:", error));
      }
    }
  }, [currentStory]);

  // Effect to update progress
  useEffect(() => {
    const audioElement = audioRef.current;
    const updateProgress = () => {
      if (audioElement && audioElement.duration) {
        setProgress((audioElement.currentTime / audioElement.duration) * 100);
      }
    };

    audioElement?.addEventListener('timeupdate', updateProgress);
    return () => {
      audioElement?.removeEventListener('timeupdate', updateProgress);
    };
  }, []);

  // Effect to handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setProgress(newProgress);
    if (audioRef.current && currentStory) {
      audioRef.current.currentTime = (newProgress / 100) * currentStory.duration;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(false); // Unmute when slider is used
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const currentTime = audioRef.current?.currentTime ?? 0;
  const totalDuration = currentStory?.duration ?? 0;

  if (!currentStory) {
    return null; // Don't render anything if no story is selected
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 w-full max-w-md p-4 shadow-xl z-50 bg-card border',
        'transition-transform duration-300 ease-in-out',
        currentStory ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      <audio ref={audioRef} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {currentStory.imageUrl && (
            <Image
              src={currentStory.imageUrl}
              alt={currentStory.title}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-sm truncate max-w-[150px]">{currentStory.title}</p>
            {/* Optional: Add artist/creator name here */}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2 mb-3">
        <Button variant="ghost" size="icon" onClick={onPrevious} disabled={!onPrevious} className="text-muted-foreground">
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button variant="default" size="icon" onClick={onPlayPause} className="rounded-full w-10 h-10">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={onNext} disabled={!onNext} className="text-muted-foreground">
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
        <span>{formatTime(currentTime)}</span>
        <Slider
          value={[progress]}
          max={100}
          step={1}
          onValueChange={handleProgressChange}
          className="flex-1"
        />
        <span>{formatTime(totalDuration)}</span>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground">
          {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.05}
          onValueChange={handleVolumeChange}
          className="w-24"
        />
      </div>
    </Card>
  );
};

export { FloatingStoryPlayer };
export type { Story as FloatingPlayerStory }; // Export the Story type for use elsewhere