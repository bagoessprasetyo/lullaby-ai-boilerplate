// lib/services/story-generation-debug-10.ts
// Use this to debug the 10% stuck issue

import { createServiceRoleClient } from '@/lib/supabase/admin';

interface StoryData {
  theme: string;
  characters: Array<{ name: string; description: string }>;
  language: string;
  voice: string;
  duration?: string;
  uploadedImages?: string[];
  targetAge?: string;
  customPrompt?: string;
}

export async function generateStoryAsync(storyId: string, storyData: StoryData) {
  console.log('='.repeat(50));
  console.log('[DEBUG 10%] Function called with:', { storyId, storyData });
  console.log('='.repeat(50));

  let supabase;
  
  try {
    // Step 1: Test database connection
    console.log('[DEBUG 10%] Step 1: Creating Supabase client...');
    supabase = createServiceRoleClient();
    console.log('[DEBUG 10%] ✅ Supabase client created successfully');

    // Step 2: Check if story exists
    console.log('[DEBUG 10%] Step 2: Checking if story exists...');
    const { data: existingStory, error: checkError } = await supabase
      .from('stories')
      .select('id, title, generation_status')
      .eq('id', storyId)
      .single();

    if (checkError) {
      console.error('[DEBUG 10%] ❌ Error checking story:', checkError);
      throw new Error(`Story not found: ${checkError.message}`);
    }

    if (!existingStory) {
      console.error('[DEBUG 10%] ❌ Story not found in database');
      throw new Error('Story record not found');
    }

    console.log('[DEBUG 10%] ✅ Story found:', existingStory);

    // Step 3: Test basic status update
    console.log('[DEBUG 10%] Step 3: Testing basic status update...');
    const testUpdateResult = await supabase
      .from('stories')
      .update({
        generation_status: 'debug-test',
        generation_progress: 5,
        current_step: 'debug-testing',
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select();

    if (testUpdateResult.error) {
      console.error('[DEBUG 10%] ❌ Test update failed:', testUpdateResult.error);
      throw new Error(`Database update failed: ${testUpdateResult.error.message}`);
    }

    console.log('[DEBUG 10%] ✅ Test update successful:', testUpdateResult.data);

    // Step 4: Try the actual first status update
    console.log('[DEBUG 10%] Step 4: Attempting first real status update (10%)...');
    
    await updateStoryStatusDebug(storyId, 'generating', 10, 'analyzing-images', supabase);
    console.log('[DEBUG 10%] ✅ First status update successful!');

    // Add a delay to see if the progress shows
    console.log('[DEBUG 10%] Waiting 2 seconds...');
    await delay(2000);

    // Step 5: Continue with simplified generation
    await updateStoryStatusDebug(storyId, 'generating', 25, 'preparing', supabase);
    console.log('[DEBUG 10%] ✅ 25% update successful!');
    
    await delay(2000);

    await updateStoryStatusDebug(storyId, 'generating', 50, 'story-generation', supabase);
    console.log('[DEBUG 10%] ✅ 50% update successful!');

    // Generate a simple story without any AI calls
    const simpleStory = generateSimpleTemplateStory(storyData);
    const simpleTitle = generateSimpleTitle(storyData);

    await delay(2000);

    await updateStoryStatusDebug(storyId, 'generating', 75, 'finalizing', supabase);
    console.log('[DEBUG 10%] ✅ 75% update successful!');

    await delay(2000);

    // Final update with story content
    console.log('[DEBUG 10%] Step 6: Final update with content...');
    const { error: finalError } = await supabase
      .from('stories')
      .update({
        title: simpleTitle,
        text_content: simpleStory,
        audio_url: 'https://via.placeholder.com/audio.mp3', // Placeholder
        generation_status: 'completed',
        generation_progress: 100,
        current_step: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId);

    if (finalError) {
      console.error('[DEBUG 10%] ❌ Final update failed:', finalError);
      throw new Error(`Final update failed: ${finalError.message}`);
    }

    console.log('[DEBUG 10%] ✅ Story generation completed successfully!');
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('[DEBUG 10%] ❌ CRITICAL ERROR:', error);
    console.error('[DEBUG 10%] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Try to update error status
    if (supabase) {
      try {
        await supabase
          .from('stories')
          .update({
            generation_status: 'error',
            error_message: `Debug: ${error.message}`,
            current_step: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', storyId);
        
        console.log('[DEBUG 10%] ✅ Error status updated in database');
      } catch (updateError) {
        console.error('[DEBUG 10%] ❌ Failed to update error status:', updateError);
      }
    }

    console.log('='.repeat(50));
  }
}

async function updateStoryStatusDebug(
  storyId: string, 
  status: string, 
  progress: number, 
  step: string,
  supabase: any
) {
  console.log(`[DEBUG 10%] Updating status: ${step} (${progress}%) - ${status}`);
  
  try {
    const { data, error } = await supabase
      .from('stories')
      .update({
        generation_status: status,
        generation_progress: progress,
        current_step: step,
        updated_at: new Date().toISOString()
      })
      .eq('id', storyId)
      .select();

    if (error) {
      console.error(`[DEBUG 10%] ❌ Status update failed:`, error);
      throw new Error(`Status update failed: ${error.message}`);
    }

    console.log(`[DEBUG 10%] ✅ Status updated successfully:`, data);
    return data;

  } catch (error) {
    console.error(`[DEBUG 10%] ❌ Exception during status update:`, error);
    throw error;
  }
}

function generateSimpleTemplateStory(storyData: StoryData): string {
  const { theme, characters, language } = storyData;
  const mainCharacter = characters[0]?.name || 'Alex';
  
  if (language === 'id') {
    return `Pada suatu hari, ada seorang anak bernama ${mainCharacter} yang sangat suka berpetualangan.

${mainCharacter} memulai petualangan ${theme} yang menakjubkan. Selama perjalanan, dia bertemu dengan teman-teman baru dan belajar hal-hal penting tentang keberanian dan kebaikan.

Setiap tantangan yang dihadapi ${mainCharacter} membuatnya menjadi lebih bijaksana. Dia belajar bahwa persahabatan dan kebaikan adalah harta yang paling berharga.

Ketika hari mulai gelap, ${mainCharacter} pulang dengan hati yang gembira. Dia tidur dengan nyenyak, bermimpi tentang petualangan baru esok hari.

Dan mereka hidup bahagia selamanya.

Tamat.`;
  }
  
  return `Once upon a time, there was a child named ${mainCharacter} who loved adventures.

${mainCharacter} began an amazing ${theme} adventure. Along the way, they met new friends and learned important things about courage and kindness.

Every challenge ${mainCharacter} faced made them wiser. They learned that friendship and kindness are the most precious treasures.

When the day grew dark, ${mainCharacter} returned home with a happy heart. They slept peacefully, dreaming of new adventures tomorrow.

And they all lived happily ever after.

The End.`;
}

function generateSimpleTitle(storyData: StoryData): string {
  const mainCharacter = storyData.characters[0]?.name || 'Friend';
  const theme = storyData.theme;
  
  if (storyData.language === 'id') {
    return `Petualangan ${theme} ${mainCharacter}`;
  }
  return `${mainCharacter}'s ${theme} Adventure`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}