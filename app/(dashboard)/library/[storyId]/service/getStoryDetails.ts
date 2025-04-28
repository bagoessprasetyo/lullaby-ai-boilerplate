// "use client";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import error from "next/error";

interface Story {
    id: string;
    title: string;
    theme: string;
    setting: string;
    tone: string;
    characters: { name: string; description: string }[];
    images: {
      id: string;
      storage_path: string;
      sequence_index: number;
    }[];
    language: string;
    voice: string;
    cover_image_url: string | null;
    text_content: string | null;
    audio_url: string | null;
    created_at: string;
    user_id: string; // Added user_id for fetching
    // Add other relevant fields from your 'stories' table
  }
  
  export async function getStoryDetails(storyId: string): Promise<Story | null> {
    const supabase = createServiceRoleClient();
    const { userId } = await auth();
    // const { data: userData } = await supabase.auth.getUser();
  
    if (!userId) {
      // Handle case where user is not logged in, maybe redirect or return null
      // Depending on your RLS policy, this might not be necessary if it prevents access anyway
      return null;
    }
  
    const { data: storyData } = await supabase
              .from('stories')
              .select(`
                  *,
                  images(id, storage_path, sequence_index),
                  profiles!inner(clerk_reference)
              `)
            //   .eq('profiles.clerk_reference', userId)
              .eq('id', storyId)
              .order('created_at', { ascending: false })
            .single();
   
            // console.log('profiles', userId)
    // console.log('storyId', storyId)
    // console.log('storyData', storyData)
  
    if (!storyData) {
      return null;
    }

    try {
      return {
        id: storyData.id,
        title: storyData.title ?? 'Untitled Story',
        theme: storyData.theme,
        setting: storyData.setting,
        tone: storyData.tone,
        characters: storyData.characters ?? [],
        language: storyData.language,
        voice: storyData.voice,
        cover_image_url: storyData.images[0]?.storage_path ?? null,
        images: storyData.images ?? [],
        text_content: storyData.text_content,
        audio_url: storyData.audio_url,
        created_at: storyData.created_at,
        user_id: storyData.user_id,
      };
    } catch (error) {
      console.error("Error mapping story data:", error);
      return null;
    }
  }
  