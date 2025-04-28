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
        console.log('getMostPlayedprofiles service ', profiles);

        return profiles || [];
    } catch (error) {
        console.error('Error fetching most played profiles:', error);
        return [];
    }
}