'use server';

import { createServiceRoleClient } from '@/lib/supabase/admin';

export async function getMostPlayedStories(userId: string, limit = 5) {
    if(!userId) {
        return [];
    }
    try {
        const supabase = createServiceRoleClient();
        const { data: stories } = await supabase
            .from('stories')
            .select(`
                *,
                images(id, storage_path, sequence_index),
                profiles!inner(clerk_reference)
            `)
            .eq('profiles.clerk_reference', userId)
            .order('play_count', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        // console.log('getMostPlayedStories user id ', userId);
        // console.log('getMostPlayedStories service ', stories);

        return stories || [];
    } catch (error) {
        console.error('Error fetching most played stories:', error);
        return [];
    }
}

export async function getUserStories(userId: string) {
    if(!userId) {
        return [];
    }
    try {
        const supabase = createServiceRoleClient();
        const { data: stories } = await supabase
            .from('stories')
            .select(`
                *,
                images(id, storage_path, sequence_index),
                profiles!inner(clerk_reference)
            `)
            .eq('profiles.clerk_reference', userId)
            .order('created_at', { ascending: false })

        // console.log('getMostPlayedStories user id ', userId);
        // console.log('getMostPlayedStories service ', stories);

        return stories || [];
    } catch (error) {
        console.error('Error fetching most played stories:', error);
        return [];
    }
}