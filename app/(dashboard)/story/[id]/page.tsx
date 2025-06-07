'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) setStory(data);
      setLoading(false);
    }

    fetchStory();
  }, [params.id]);

  if (loading) return <div>Loading story...</div>;
  if (!story) return <div>Story not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
      {story.audio_url && (
        <audio controls className="mb-4">
          <source src={story.audio_url} type="audio/mpeg" />
        </audio>
      )}
      <div className="prose max-w-none">
        {story.text_content || 'Story content will appear here...'}
      </div>
    </div>
  );
}