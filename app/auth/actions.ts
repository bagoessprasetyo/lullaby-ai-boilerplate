'use server';

import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function upsertUserProfile(profileData: {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  oauth_id?: string | null;
  clerk_reference?: string | null;
}) {
  // Get user ID from Clerk
  const { userId } = await auth();
  
  if (!userId) {
    return { error: { message: 'Unauthorized - No Clerk user session' } };
  }

  // Use Clerk's userId directly as it's already a unique identifier
  const formattedUUID = userId;

  // Always use admin client for profile upsert to bypass RLS
  const adminClient = createServiceRoleClient();

  // First check if profile exists with this clerk_reference
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('clerk_reference', userId)
    .maybeSingle();

  const profileId = existingProfile?.id || crypto.randomUUID();

  // console.log('PROFILE DATA: ', profileId)
  
  const { data, error } = await adminClient
    .from('profiles')
    .upsert({
      id: profileId,
      email: profileData.email,
      name: profileData.name || profileData.email.split('@')[0],
      avatar_url: profileData.avatar_url,
      oauth_id: profileData.oauth_id || profileData.id,
      clerk_reference: userId,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subscription_tier: 'free',
      subscription_status: 'active',
      voice_credits: 0, // Initial credits
      story_credits: 1 // Initial credits
    })
    .select()
    .single();
  

  if (error) {
    console.error('Supabase upsert error:', error);
    console.error('Failed profile data:', profileData);
    return { 
      error: {
        ...error,
        message: error.message || 'Database error saving new user'
      } 
    };
  }

  // Revalidate any paths that might need fresh user data
  revalidatePath('/');
  revalidatePath('/dashboard');

  return { data };
}