// app/api/voices/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  description: string;
  preview_url: string;
  labels: {
    language: string;
    gender: string;
    age: string;
    accent?: string;
    descriptive?: string;
    use_case?: string;
  };
  category: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log('[Voices API] Fetching voices from ElevenLabs...');

    const response = await fetch('https://api.elevenlabs.io/v2/voices', {
      headers: {
        'Xi-Api-Key': process.env.ELEVENLABS_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Voices API] Received', data.voices?.length, 'voices from ElevenLabs');

    // Filter and format voices for story narration
    const storyVoices = data.voices
      ?.filter((voice: ElevenLabsVoice) => {
        // Filter for story-appropriate voices
        return (
          voice.labels?.use_case === 'narrative_story' ||
          voice.labels?.descriptive?.includes('storytell') ||
          voice.labels?.descriptive?.includes('calm') ||
          voice.labels?.descriptive?.includes('warm') ||
          voice.category === 'professional'
        );
      })
      .map((voice: ElevenLabsVoice) => ({
        value: voice.voice_id,
        label: voice.name,
        description: voice.description || 'Professional voice for storytelling',
        language: voice.labels?.language || 'en',
        gender: voice.labels?.gender || 'neutral',
        age: voice.labels?.age || 'adult',
        accent: voice.labels?.accent || 'standard',
        preview_url: voice.preview_url,
        category: voice.category,
        descriptive: voice.labels?.descriptive || 'professional'
      }))
      .sort((a: any, b: any) => {
        // Sort by language first (id first, then en), then by gender
        if (a.language !== b.language) {
          if (a.language === 'id') return -1;
          if (b.language === 'id') return 1;
          return a.language.localeCompare(b.language);
        }
        return a.gender.localeCompare(b.gender);
      });

    console.log('[Voices API] Filtered to', storyVoices?.length, 'story-appropriate voices');

    // Group by language for easier filtering
    const voicesByLanguage = storyVoices?.reduce((acc: any, voice: any) => {
      if (!acc[voice.language]) {
        acc[voice.language] = [];
      }
      acc[voice.language].push(voice);
      return acc;
    }, {});

    return NextResponse.json({
      voices: storyVoices || [],
      voicesByLanguage: voicesByLanguage || {},
      total: storyVoices?.length || 0
    });

  } catch (error: any) {
    console.error('[Voices API] Error fetching voices:', error);
    
    // Return fallback voices if API fails
    const fallbackVoices = [
      {
        value: "fallback-gentle-male",
        label: "Gentle Male (Fallback)",
        description: "A soft and soothing male voice",
        language: "en",
        gender: "male",
        age: "adult",
        accent: "american",
        preview_url: null,
        category: "fallback",
        descriptive: "gentle"
      },
      {
        value: "fallback-warm-female",
        label: "Warm Female (Fallback)",
        description: "A kind and comforting female voice",
        language: "en",
        gender: "female",
        age: "adult",
        accent: "american",
        preview_url: null,
        category: "fallback",
        descriptive: "warm"
      }
    ];

    return NextResponse.json({
      voices: fallbackVoices,
      voicesByLanguage: { en: fallbackVoices },
      total: fallbackVoices.length,
      error: 'Using fallback voices - ElevenLabs API unavailable'
    });
  }
}