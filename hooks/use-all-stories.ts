"use client";

import { useQuery } from '@tanstack/react-query';
import { getUserStories } from '@/lib/services/story-service';

export function useUserStories(userId: string | undefined, limit = 5) {
    // console.log('useMostPlayedStories', userId);
  return useQuery({
    queryKey: ['all_stories', userId],
    queryFn: () => getUserStories(userId || ''),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}