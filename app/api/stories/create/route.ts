// app/api/stories/create/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { generateStoryAsync } from '@/lib/services/story-generation';

export async function POST(req: NextRequest) {
  try {
    console.log('[Stories Create] API route called');
    
    const { userId } = await auth();
    console.log('[Stories Create] User ID:', userId);
    
    if (!userId) {
      console.log('[Stories Create] No userId found from auth()');
      return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    // Parse FormData from the request
    const formData = await req.formData();
    console.log('[Stories Create] FormData received');

    // Extract story data
    const storyDataJson = formData.get('storyData') as string;
    if (!storyDataJson) {
      return NextResponse.json({ error: 'Missing story data' }, { status: 400 });
    }

    const storyData = JSON.parse(storyDataJson);
    console.log('[Stories Create] Story data parsed:', storyData);

    // Extract image files
    const imageFiles: File[] = [];
    let imageIndex = 0;
    while (formData.get(`coverImage_${imageIndex}`)) {
      const file = formData.get(`coverImage_${imageIndex}`) as File;
      imageFiles.push(file);
      imageIndex++;
    }
    console.log('[Stories Create] Image files found:', imageFiles.length);

    // Get Supabase client
    const supabase = createServiceRoleClient();

    // Get or create user profile
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_reference', userId)
      .maybeSingle();

    console.log('[Stories Create] Profile lookup result:', { profile, error: profileError });

    // If no profile exists, create one
    if (!profile && !profileError) {
      console.log('[Stories Create] Creating new profile for user:', userId);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          clerk_reference: userId,
          email: 'temp@example.com', // Will be updated from Clerk webhook
          name: 'User',
          subscription_tier: 'free',
          subscription_status: 'active',
          story_credits: 1
        })
        .select()
        .single();

      if (createError) {
        console.error('[Stories Create] Error creating profile:', createError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      profile = newProfile;
      console.log('[Stories Create] Created new profile:', profile);
    }

    if (profileError) {
      console.error('[Stories Create] Profile error:', profileError);
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 });
    }

    // Create story title from character names or use theme
    const characterNames = storyData.characters?.map((char: any) => char.name).filter(Boolean);
    const storyTitle = characterNames?.length > 0 
      ? `${characterNames[0]}'s ${storyData.theme} Adventure`
      : `A ${storyData.theme} Story`;

    console.log('[Stories Create] Generated story title:', storyTitle);

    // Create story record in database first
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: profile.id, // Use profile.id, not userId (Clerk ID)
        title: storyTitle,
        theme: storyData.theme || 'adventure',
        language: storyData.language || 'en',
        generation_status: 'pending',
        generation_progress: 0,
        current_step: 'story-generation',
        // Store the form data as JSON for now
        content: JSON.stringify({
          characters: storyData.characters || [],
          voice: storyData.voice || 'default-en-male',
          duration: storyData.duration || 'short',
          imageCount: imageFiles.length
        })
      })
      .select()
      .single();

    if (storyError) {
      console.error('[Stories Create] Error creating story:', storyError);
      return NextResponse.json({ error: 'Failed to create story record' }, { status: 500 });
    }

    console.log('[Stories Create] Story created successfully:', story.id);

    // Upload images to Supabase Storage
    const uploadedImageUrls: string[] = [];
    if (imageFiles.length > 0) {
      console.log('[Stories Create] Uploading', imageFiles.length, 'images to Supabase Storage...');
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${story.id}_${i}.${fileExt}`;
        const filePath = `story-images/${fileName}`;

        try {
          // Convert File to ArrayBuffer
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('stories')
            .upload(filePath, uint8Array, {
              contentType: file.type,
              upsert: true
            });

          if (uploadError) {
            console.error('[Stories Create] Error uploading image:', uploadError);
            continue; // Skip this image but continue with others
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('stories')
            .getPublicUrl(filePath);

          uploadedImageUrls.push(publicUrl);

          // Save image record to database
          await supabase
            .from('images')
            .insert({
              story_id: story.id,
              user_id: profile.id,
              storage_path: filePath,
              sequence_index: i
            });

          console.log('[Stories Create] Image uploaded successfully:', publicUrl);

        } catch (error) {
          console.error('[Stories Create] Error processing image:', error);
          continue; // Skip this image but continue with others
        }
      }

      console.log('[Stories Create] Successfully uploaded', uploadedImageUrls.length, 'images');
    }

    // Start async story generation (non-blocking)
    console.log('[Stories Create] Starting story generation...');
    generateStoryAsync(story.id, {
      ...storyData,
      uploadedImages: uploadedImageUrls
    }).catch(error => {
      console.error('[Stories Create] Story generation failed:', error);
    });

    // Return the story ID to the client immediately
    return NextResponse.json({ 
      storyId: story.id,
      message: 'Story creation started successfully',
      imagesUploaded: uploadedImageUrls.length
    });

  } catch (err: any) {
    console.error('[Stories Create] Error creating story:', err);
    
    // More specific error handling
    if (err.message?.includes('JSON')) {
      return NextResponse.json({ 
        error: 'Invalid story data format' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create story. Please try again.' 
    }, { status: 500 });
  }
}