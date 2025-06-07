import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/admin';
import { generateStoryAsync } from '@/lib/services/story-generation';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient();
    
    // Reset story status
    const { error } = await supabase
      .from('stories')
      .update({
        generation_status: 'pending',
        generation_progress: 0,
        current_step: 'story-generation',
        error_message: null
      })
      .eq('id', params.id);

    if (error) throw error;

    // Restart generation
    generateStoryAsync(params.id, {
        theme: '',
        characters: [],
        language: '',
        voice: ''
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Retry error:', error);
    return NextResponse.json({ error: 'Failed to retry' }, { status: 500 });
  }
}