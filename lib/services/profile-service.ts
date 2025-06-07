// import { createServiceRoleClient } from "../supabase/admin";
'use server'
import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "../supabase/admin";

export async function getProfile(user_id: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role key is missing from environment variables');
  }
  const { userId } = await auth();
  
//   if (!user_id) {
//     return { error: { message: 'Unauthorized - No Clerk user session' } };
//   }
    if(!userId) {
        return [];
    }
    try {
        const adminClient = createServiceRoleClient();
        const { data: profiles } = await adminClient
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