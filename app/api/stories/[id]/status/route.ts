// app/api/stories/[id]/status/route.ts (FIXED VERSION)
import { NextRequest, NextResponse } from 'next/server';
import { executeSupabaseOperation } from '@/lib/supabase/client-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Story Status] Checking status for story:', params.id);
    console.log('id', params.id)
    
    // Get expected progress from query params for stale data detection
    const url = new URL(req.url);
    const expectedProgress = url.searchParams.get('expectedProgress');
    
    // Use the centralized client manager with built-in retry logic
    const result = await executeSupabaseOperation(async (supabase) => {
      const { data, error } = await supabase
        .from('stories')
        .select('generation_status, generation_progress, current_step, error_message, updated_at')
        .eq('id', params.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Check for stale data if expected progress is provided
      if (expectedProgress && data) {
        const expected = parseInt(expectedProgress);
        if (data.generation_progress < expected) {
          console.log(`[Story Status] Possible stale data: expected ${expected}%, got ${data.generation_progress}%`);
          throw new Error('STALE_DATA'); // This will trigger a retry
        }
      }
      
      return data;
    }, 3, 400); // 3 retries with 400ms base delay
    
    const story = result;
    const error = null;
    if (error) {
      console.error('[Story Status] Database error:', error);
      throw error;
    }

    if (!story) {
      console.log('[Story Status] Story not found:', params.id);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    console.log('[Story Status] Current status:', {
      status: story.generation_status,
      progress: story.generation_progress,
      step: story.current_step,
      updated_at: story.updated_at
    });

    // Map backend step names to frontend expected names
    const mappedStep = mapBackendStepToFrontend(story.current_step);

    const response = {
      status: story.generation_status,
      progress: story.generation_progress,
      currentStep: mappedStep,
      error: story.error_message,
      completed: story.generation_status === 'completed',
      timestamp: story.updated_at
    };

    console.log('[Story Status] Returning response:', response);

    // Add cache-busting headers to prevent stale data
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    return NextResponse.json(response, { headers });

  } catch (error: any) {
    console.error('[Story Status] Error checking status:', error);
    return NextResponse.json({ 
      error: 'Failed to get story status',
      details: error.message 
    }, { status: 500 });
  }
}

function mapBackendStepToFrontend(backendStep: string): string {
  // Map backend step names to frontend expected step names
  const stepMapping: { [key: string]: string } = {
    'analyzing-images': 'story-generation',
    'generating-title': 'story-generation', 
    'story-generation': 'story-generation',
    'audio-generation': 'audio-generation',
    'image-generation': 'image-generation',
    'finalizing': 'image-generation',
    'saving': 'image-generation',
    'completed': 'completed',
    'error': 'error'
  };

  const mapped = stepMapping[backendStep] || backendStep;
  console.log('[Story Status] Mapped step:', backendStep, '->', mapped);
  
  return mapped;
}