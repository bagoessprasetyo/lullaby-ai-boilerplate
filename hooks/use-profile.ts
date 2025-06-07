// hooks/use-profile.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client'; // Use browser client for hooks
import { getProfile } from '@/lib/services/profile-service';

// Define your profile type (ideally generated from your DB schema)
type Profile = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    subscription_tier: string | null;
    subscription_status: string | null;
    subscription_expiry: string | null;
    story_credits: number | null;
    // Add other profile fields
};

export function useProfile(userId: string | undefined) {
    // const supabase = createClient(); // Get Supabase client instance

    // Use TanStack Query's useQuery hook
    return useQuery<Profile | null>({
        queryKey: ['profile', userId], // Unique key for this query
        queryFn: async () => {
            console.log('[useProfile Hook] queryFn started. userId:', userId); // Added log
            if (!userId) {
                console.log('[useProfile Hook] No userId, returning null.'); // Added log
                return null;
            }
            try {
                console.log('[useProfile Hook] Calling getProfile with userId:', userId); // Added log
                const profileData = await getProfile(userId);
                console.log('[useProfile Hook] Received profileData from service:', profileData); // Modified log
                // The service function already handles the case where profile might be null or empty array
                // Ensure the return type matches Profile | null
                const result = profileData && !Array.isArray(profileData) ? profileData : null;
                console.log('[useProfile Hook] Processed result:', result); // Added log
                return result;
            } catch (error) {
                console.error('[useProfile Hook] Error fetching profile:', error); // Added log context
                throw error; // Re-throw error for TanStack Query to handle
            }
        },
        // enabled: !!userId, // Only run the query if userId is available
        staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    });
}
