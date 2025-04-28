"use client";

import { useQuery } from '@tanstack/react-query';
import { getMostPlayedStories } from '@/lib/services/story-service';

export function useMostPlayedStories(userId: string | undefined, limit = 5) {
    // console.log('useMostPlayedStories', userId);
  return useQuery({
    queryKey: ['most_played_stories', userId, limit],
    queryFn: () => getMostPlayedStories(userId || '', limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}