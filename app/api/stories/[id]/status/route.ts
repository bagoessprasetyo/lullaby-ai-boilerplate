// app/api/stories/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Story Status] Checking status for story:', params.id);
    
    const supabase = createServiceRoleClient();
    
    const { data: story, error } = await supabase
      .from('stories')
      .select('generation_status, generation_progress, current_step, error_message')
      .eq('id', params.id)
      .single();

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
      step: story.current_step
    });

    return NextResponse.json({
      status: story.generation_status,
      progress: story.generation_progress,
      currentStep: story.current_step,
      error: story.error_message,
      completed: story.generation_status === 'completed'
    });

  } catch (error: any) {
    console.error('[Story Status] Error checking status:', error);
    return NextResponse.json({ 
      error: 'Failed to get story status',
      details: error.message 
    }, { status: 500 });
  }
}