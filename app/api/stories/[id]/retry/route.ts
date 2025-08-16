// app/api/stories/[id]/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { generateStoryAsync } from '@/lib/services/story-generation';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Story Retry] Starting retry for story:', params.id);
    
    const supabase = createServiceRoleClient();
    
    // Get the existing story data
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select(`
        *,
        images(id, storage_path, full_url, sequence_index)
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !story) {
      console.error('[Story Retry] Story not found:', fetchError);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    console.log('[Story Retry] Found story:', story.title || 'Untitled');

    // Parse the content to get original story data
    let originalStoryData;
    try {
      originalStoryData = JSON.parse(story.content || '{}');
    } catch (parseError) {
      console.error('[Story Retry] Error parsing story content:', parseError);
      originalStoryData = {
        characters: [],
        voice: 'default-id-male',
        duration: 'medium',
        targetAge: 'mixed',
        theme: story.theme || 'adventure'
      };
    }

    // Get uploaded image URLs if any
    const uploadedImages = story.images
      ?.sort((a: any, b: any) => a.sequence_index - b.sequence_index)
      ?.map((img: any) => img.full_url || img.storage_path)
      ?.filter(Boolean) || [];

    console.log('[Story Retry] Found', uploadedImages.length, 'uploaded images');

    // Reset story status
    const { error: resetError } = await supabase
      .from('stories')
      .update({
        generation_status: 'pending',
        generation_progress: 0,
        current_step: 'starting-retry',
        error_message: null,
        text_content: null,
        audio_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (resetError) {
      console.error('[Story Retry] Error resetting story status:', resetError);
      throw resetError;
    }

    // Prepare story data for regeneration
    const retryStoryData = {
      theme: story.theme || originalStoryData.theme || 'adventure',
      characters: originalStoryData.characters || [],
      language: story.language || 'en',
      voice: originalStoryData.voice || 'default-id-male',
      duration: originalStoryData.duration || 'medium',
      targetAge: originalStoryData.targetAge || 'mixed',
      customPrompt: originalStoryData.customPrompt || '',
      uploadedImages: uploadedImages
    };

    console.log('[Story Retry] Retry story data prepared:', {
      theme: retryStoryData.theme,
      charactersCount: retryStoryData.characters.length,
      language: retryStoryData.language,
      voice: retryStoryData.voice,
      duration: retryStoryData.duration,
      targetAge: retryStoryData.targetAge,
      imagesCount: retryStoryData.uploadedImages?.length || 0
    });

    // Restart generation with the preserved data
    generateStoryAsync(params.id, retryStoryData).catch(error => {
      console.error('[Story Retry] Async generation failed:', error);
    });

    console.log('[Story Retry] Retry initiated successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Story retry initiated',
      storyData: retryStoryData
    });

  } catch (error: any) {
    console.error('[Story Retry] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to retry story generation',
      details: error.toString()
    }, { status: 500 });
  }
}