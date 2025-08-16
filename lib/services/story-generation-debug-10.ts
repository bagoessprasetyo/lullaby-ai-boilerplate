  // // lib/services/story-generation-debug-10.ts
  // // Use this to debug the 10% stuck issue

  // import { executeSupabaseOperation } from '@/lib/supabase/client-manager';

  // interface StoryData {
  //   theme: string;
  //   characters: Array<{ name: string; description: string }>;
  //   language: string;
  //   voice: string;
  //   duration?: string;
  //   uploadedImages?: string[];
  //   targetAge?: string;
  //   customPrompt?: string;
  // }

  // export async function generateStoryAsync(storyId: string, storyData: StoryData) {
  //   console.log('='.repeat(50));
  //   console.log('[DEBUG 10%] Function called with:', { storyId, storyData });
  //   console.log('='.repeat(50));

  //   try {
  //     console.log('[DEBUG 10%] Step 1: Starting story generation process...');
  //     console.log('[DEBUG 10%] ✅ Using centralized Supabase client manager');

  //     // Step 2: Check if story exists
  //     console.log('[DEBUG 10%] Step 2: Checking if story exists...');
  //     const existingStory = await executeSupabaseOperation(async (supabase) => {
  //       const { data, error } = await supabase
  //         .from('stories')
  //         .select('id, title, generation_status')
  //         .eq('id', storyId)
  //         .single();
        
  //       if (error) {
  //         console.error('[DEBUG 10%] ❌ Story fetch failed:', error);
  //         throw new Error(`Story not found: ${error.message}`);
  //       }
        
  //       if (!data) {
  //         console.error('[DEBUG 10%] ❌ Story not found in database');
  //         throw new Error('Story record not found');
  //       }
        
  //       return data;
  //     });
      
  //     console.log('[DEBUG 10%] ✅ Story found:', existingStory);

  //     // Step 3: Test basic status update
  //     console.log('[DEBUG 10%] Step 3: Testing basic status update...');
  //     const testUpdateResult = await supabase
  //       .from('stories')
  //       .update({
  //         generation_status: 'debug-test',
  //         generation_progress: 5,
  //         current_step: 'debug-testing',
  //         updated_at: new Date().toISOString()
  //       })
  //       .eq('id', storyId)
  //       .select();

  //     if (testUpdateResult.error) {
  //       console.error('[DEBUG 10%] ❌ Test update failed:', testUpdateResult.error);
  //       throw new Error(`Database update failed: ${testUpdateResult.error.message}`);
  //     }

  //     console.log('[DEBUG 10%] ✅ Test update successful:', testUpdateResult.data);

  //     // Step 4: Try the actual first status update
  //     console.log('[DEBUG 10%] Step 4: Attempting first real status update (10%)...');
      
  //     await updateStoryStatusDebug(storyId, 'generating', 10, 'analyzing-images');
  //     console.log('[DEBUG 10%] ✅ First status update successful!');

  //     // Add a delay to see if the progress shows
  //     console.log('[DEBUG 10%] Waiting 2 seconds...');
  //     await delay(2000);

  //     // Step 5: Continue with simplified generation
  //     await updateStoryStatusDebug(storyId, 'generating', 25, 'preparing');
  //     console.log('[DEBUG 10%] ✅ 25% update successful!');
      
  //     await delay(2000);

  //     await updateStoryStatusDebug(storyId, 'generating', 50, 'story-generation');
  //     console.log('[DEBUG 10%] ✅ 50% update successful!');

  //     // Generate a simple story without any AI calls
  //     const simpleStory = generateSimpleTemplateStory(storyData);
  //     const simpleTitle = generateSimpleTitle(storyData);

  //     await delay(2000);

  //     await updateStoryStatusDebug(storyId, 'generating', 75, 'finalizing');
  //     console.log('[DEBUG 10%] ✅ 75% update successful!');

  //     await delay(2000);

  //     // Step 6: Final update with story content
  //     console.log('[DEBUG 10%] Step 6: Final update with content...');
  //     await executeSupabaseOperation(async (supabase) => {
  //       const { error: finalError } = await supabase
  //         .from('stories')
  //         .update({
  //           title: simpleTitle,
  //           text_content: simpleStory,
  //           audio_url: 'https://via.placeholder.com/audio.mp3', // Placeholder
  //           generation_status: 'completed',
  //           generation_progress: 100,
  //           current_step: 'completed',
  //           updated_at: new Date().toISOString()
  //         })
  //         .eq('id', storyId);

  //       if (finalError) {
  //         console.error('[DEBUG 10%] ❌ Final update failed:', finalError);
  //         throw new Error(`Final update failed: ${finalError.message}`);
  //       }
  //     });

  //     console.log('[DEBUG 10%] ✅ Story generation completed successfully!');
  //     console.log('='.repeat(50));

  //   } catch (error: any) {
  //     console.error('[DEBUG 10%] ❌ CRITICAL ERROR:', error);
  //     console.error('[DEBUG 10%] Error details:', {
  //       message: error.message,
  //       stack: error.stack,
  //       name: error.name
  //     });

  //     // Try to update error status
  //     if (supabase) {
  //       try {
  //         await supabase
  //           .from('stories')
  //           .update({
  //             generation_status: 'error',
  //             error_message: `Debug: ${error.message}`,
  //             current_step: 'error',
  //             updated_at: new Date().toISOString()
  //           })
  //           .eq('id', storyId);
          
  //         console.log('[DEBUG 10%] ✅ Error status updated in database');
  //       } catch (updateError) {
  //         console.error('[DEBUG 10%] ❌ Failed to update error status:', updateError);
  //       }
  //     }

  //     console.log('='.repeat(50));
  //   }
  // }

  // export async function updateStoryStatusDebug(
  //   storyId: string,
  //   status: string,
  //   progress: number,
  //   currentStep: string,
  //   errorMessage?: string
  // ): Promise<void> {
  //   try {
  //     console.log(`[Story Update] Updating story ${storyId}: status=${status}, progress=${progress}%, step=${currentStep}`);
      
  //     const updateData: any = {
  //       generation_status: status,
  //       generation_progress: progress,
  //       current_step: currentStep,
  //       updated_at: new Date().toISOString()
  //     };
      
  //     if (errorMessage) {
  //       updateData.error_message = errorMessage;
  //     }
      
  //     // Use the centralized client manager for the update operation
  //     await executeSupabaseOperation(async (supabase) => {
  //       const { data, error } = await supabase
  //         .from('stories')
  //         .update(updateData)
  //         .eq('id', storyId)
  //         .select();
        
  //       if (error) {
  //         console.error(`[Story Update] Failed to update story ${storyId}:`, error);
  //         throw error;
  //       }
        
  //       // Check if no rows were updated
  //       if (!data || data.length === 0) {
  //         console.warn(`[Story Update] No rows updated for story ${storyId}. Story may not exist.`);
  //         throw new Error(`Story ${storyId} not found or could not be updated`);
  //       }
        
  //       console.log(`[Story Update] Successfully updated story ${storyId}:`, data[0]);
  //       return data[0];
  //     }, 2, 300); // 2 retries with 300ms base delay
      
  //     // Add a small delay to ensure the write is committed
  //     await new Promise(resolve => setTimeout(resolve, 500));
      
  //     // Verify the update with a separate operation
  //     const verifyData = await executeSupabaseOperation(async (supabase) => {
  //       const { data, error } = await supabase
  //         .from('stories')
  //         .select('generation_status, generation_progress, current_step')
  //         .eq('id', storyId)
  //         .single();
        
  //       if (error) {
  //         console.warn(`[Story Update] Could not verify update for story ${storyId}:`, error);
  //         return null;
  //       }
        
  //       return data;
  //     }, 1, 200); // Single retry for verification
      
  //     if (verifyData) {
  //       console.log(`[Story Update] Verification read for story ${storyId}:`, verifyData);
        
  //       // Check if the progress matches what we just wrote
  //       if (verifyData.generation_progress !== progress) {
  //         console.warn(`[Story Update] Progress mismatch! Expected ${progress}%, got ${verifyData.generation_progress}%`);
  //       }
  //     }
      
  //   } catch (error: any) {
  //     console.error(`[Story Update] Error updating story ${storyId}:`, error.message);
  //     throw error;
  //   }
  // }

  // function generateSimpleTemplateStory(storyData: StoryData): string {
  //   const { theme, characters, language } = storyData;
  //   const mainCharacter = characters[0]?.name || 'Alex';
    
  //   if (language === 'id') {
  //     return `Pada suatu hari, ada seorang anak bernama ${mainCharacter} yang sangat suka berpetualangan.

  // ${mainCharacter} memulai petualangan ${theme} yang menakjubkan. Selama perjalanan, dia bertemu dengan teman-teman baru dan belajar hal-hal penting tentang keberanian dan kebaikan.

  // Setiap tantangan yang dihadapi ${mainCharacter} membuatnya menjadi lebih bijaksana. Dia belajar bahwa persahabatan dan kebaikan adalah harta yang paling berharga.

  // Ketika hari mulai gelap, ${mainCharacter} pulang dengan hati yang gembira. Dia tidur dengan nyenyak, bermimpi tentang petualangan baru esok hari.

  // Dan mereka hidup bahagia selamanya.

  // Tamat.`;
  //   }
    
  //   return `Once upon a time, there was a child named ${mainCharacter} who loved adventures.

  // ${mainCharacter} began an amazing ${theme} adventure. Along the way, they met new friends and learned important things about courage and kindness.

  // Every challenge ${mainCharacter} faced made them wiser. They learned that friendship and kindness are the most precious treasures.

  // When the day grew dark, ${mainCharacter} returned home with a happy heart. They slept peacefully, dreaming of new adventures tomorrow.

  // And they all lived happily ever after.

  // The End.`;
  // }

  // function generateSimpleTitle(storyData: StoryData): string {
  //   const mainCharacter = storyData.characters[0]?.name || 'Friend';
  //   const theme = storyData.theme;
    
  //   if (storyData.language === 'id') {
  //     return `Petualangan ${theme} ${mainCharacter}`;
  //   }
  //   return `${mainCharacter}'s ${theme} Adventure`;
  // }

  // function delay(ms: number): Promise<void> {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }