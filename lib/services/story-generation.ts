// lib/services/story-generation.ts
import { createServiceRoleClient } from '@/lib/supabase/admin';

interface StoryData {
  theme: string;
  characters: Array<{ name: string; description: string }>;
  language: string;
  voice: string;
}

export async function generateStoryAsync(storyId: string, storyData: StoryData) {
  const supabase = createServiceRoleClient();
  
  console.log('[Story Generation] Starting generation for story:', storyId);
  
  try {
    // Step 1: Update status to generating
    await updateStoryStatus(storyId, 'generating', 10, 'story-generation');
    
    // Simulate story text generation (5 seconds)
    await delay(5000);
    const storyText = await generateStoryText(storyData);
    await updateStoryStatus(storyId, 'generating', 50, 'audio-generation');

    // Simulate audio generation (8 seconds)
    await delay(8000);
    const audioUrl = await generateAudio(storyText);
    await updateStoryStatus(storyId, 'generating', 80, 'image-generation');

    // Simulate image generation (5 seconds)
    await delay(5000);
    await updateStoryStatus(storyId, 'generating', 95, 'finalizing');

    // Final step: Save completed story (2 seconds)
    await delay(2000);
    await supabase
      .from('stories')
      .update({
        text_content: storyText,
        audio_url: audioUrl,
        generation_status: 'completed',
        generation_progress: 100,
        current_step: 'completed'
      })
      .eq('id', storyId);

    console.log('[Story Generation] Completed story generation for:', storyId);

  } catch (error: any) {
    console.error('[Story Generation] Error generating story:', error);
    await supabase
      .from('stories')
      .update({
        generation_status: 'error',
        error_message: error.message || 'Unknown error occurred during generation',
        current_step: 'error'
      })
      .eq('id', storyId);
  }
}

async function generateStoryText(storyData: StoryData): Promise<string> {
  console.log('[Story Generation] Generating story text...');
  
  // Simulate OpenAI story generation
  // TODO: Replace with actual OpenAI API call
  const characterNames = storyData.characters.map(c => c.name).join(', ');
  const mainCharacter = storyData.characters[0]?.name || 'Alex';
  
  const simulatedStory = `
Once upon a time in a ${storyData.theme} world, there lived a brave character named ${mainCharacter}.

${characterNames ? `Along with their friends ${characterNames}, ` : ''}${mainCharacter} discovered something magical that would change their life forever.

As they embarked on their ${storyData.theme} adventure, ${mainCharacter} learned valuable lessons about friendship, courage, and believing in themselves.

The journey was filled with wonder and excitement, leading to a heartwarming conclusion where ${mainCharacter} realized that the real treasure was the friends they made along the way.

And they all lived happily ever after.

The End.
  `.trim();

  console.log('[Story Generation] Story text generated successfully');
  return simulatedStory;
}

async function generateAudio(text: string): Promise<string> {
  console.log('[Story Generation] Generating audio...');
  
  // Simulate TTS generation
  // TODO: Replace with actual ElevenLabs or AWS Polly integration
  
  // For now, return a placeholder URL
  // In production, this would upload audio to Supabase Storage
  const placeholderAudioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
  
  console.log('[Story Generation] Audio generation completed');
  return placeholderAudioUrl;
}

async function updateStoryStatus(
  storyId: string, 
  status: string, 
  progress: number, 
  step: string
) {
  const supabase = createServiceRoleClient();
  
  console.log(`[Story Generation] Updating status: ${status} (${progress}%) - ${step}`);
  
  const { error } = await supabase
    .from('stories')
    .update({
      generation_status: status,
      generation_progress: progress,
      current_step: step
    })
    .eq('id', storyId);

  if (error) {
    console.error('[Story Generation] Error updating status:', error);
    throw error;
  }
}

// Utility function to simulate async delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export for testing purposes
export { generateStoryText, generateAudio, updateStoryStatus };