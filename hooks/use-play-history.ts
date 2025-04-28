import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type PlayHistoryItem = {
  id: string;
  story_id: string;
  played_at: string;
  completed: boolean;
  progress_percentage: number;
  story_title?: string;
  story_audio_url?: string;
  story_theme?: string;
};

export function usePlayHistory(userId: string | undefined, limit = 5) {
  const supabase = createClient();
  return useQuery<PlayHistoryItem[]>({
    queryKey: ['play_history', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('play_history')
        .select(`id, story_id, played_at, completed, progress_percentage, stories(title, audio_url, theme)`)
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        story_id: item.story_id,
        played_at: item.played_at,
        completed: item.completed,
        progress_percentage: item.progress_percentage,
        story_title: item.stories?.title,
        story_audio_url: item.stories?.audio_url,
        story_theme: item.stories?.theme,
      }));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStoryStreak(userId: string | undefined) {
  const supabase = createClient();
  return useQuery<number>({
    queryKey: ['story_streak', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { data, error } = await supabase
        .from('play_history')
        .select('played_at')
        .eq('user_id', userId)
        .order('played_at', { ascending: false });
      if (error) throw error;
      // Calculate streak: count consecutive days with at least one play
      const dates = Array.from(new Set((data || []).map((item: any) => item.played_at.slice(0, 10))));
      let streak = 0;
      let current = new Date();
      for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        if (i === 0) {
          if (date.toDateString() !== current.toDateString()) break;
        } else {
          current.setDate(current.getDate() - 1);
          if (date.toDateString() !== current.toDateString()) break;
        }
        streak++;
      }
      return streak;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}