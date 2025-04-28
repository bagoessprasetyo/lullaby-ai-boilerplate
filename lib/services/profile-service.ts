import { createServiceRoleClient } from "../supabase/admin";

export async function getProfile(userId: string) {
    if(!userId) {
        return [];
    }
    try {
        const supabase = createServiceRoleClient();
        const { data: profiles } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                full_name,
                avatar_url,
                subscription_tier,
                subscription_status,
                subscription_expiry,
                story_credits
            `)
            .eq('clerk_reference', userId)
            .maybeSingle();

        // console.log('getMostPlayedprofiles user id ', userId);
        console.log('getProfile service result:', profiles); // Updated log message

        // Return the profile object or null if not found
        return profiles || null;
    } catch (error) {
        console.error('Error fetching profile:', error); // Updated log message
        return null; // Return null on error as well, consistent with expected type
    }
}