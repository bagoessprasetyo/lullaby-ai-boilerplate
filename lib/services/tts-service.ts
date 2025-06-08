// lib/services/tts-service.ts
import { createServiceRoleClient } from '@/lib/supabase/admin';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface TTSOptions {
  voice_id: string;
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
}

// Voice configurations optimized for storytelling
const STORYTELLING_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.75,        // Higher stability for consistent narration
  similarity_boost: 0.8,  // Good balance for natural speech
  style: 0.5,            // Moderate style enhancement
  use_speaker_boost: true // Enhanced clarity
};

// Model configurations
const TTS_MODELS = {
  turbo: 'eleven_turbo_v2',           // Fastest, good quality
  multilingual: 'eleven_multilingual_v2', // Best for non-English
  standard: 'eleven_monolingual_v1'   // Highest quality English
};

export async function generateAudio(text: string, voiceValue: string): Promise<string> {
  console.log('[TTS Service] Starting audio generation...');
  console.log('[TTS Service] Voice:', voiceValue);
  console.log('[TTS Service] Text length:', text.length);

  try {
    // Handle default/fallback voices vs ElevenLabs voices
    if (voiceValue.startsWith('default-') || voiceValue.startsWith('fallback-')) {
      console.log('[TTS Service] Using fallback TTS for default voice');
      return await generateFallbackAudio(text, voiceValue);
    }

    // Use ElevenLabs for premium voices
    return await generateElevenLabsAudio(text, voiceValue);

  } catch (error: any) {
    console.error('[TTS Service] Error generating audio:', error);
    
    // Fallback to default TTS if ElevenLabs fails
    console.log('[TTS Service] Falling back to default TTS...');
    return await generateFallbackAudio(text, voiceValue);
  }
}

async function generateElevenLabsAudio(text: string, voiceId: string): Promise<string> {
  console.log('[TTS Service] Using ElevenLabs for voice:', voiceId);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Determine language and model
  const isIndonesian = text.includes('Pada suatu ketika') || text.includes('Tamat.');
  const modelId = isIndonesian ? TTS_MODELS.multilingual : TTS_MODELS.turbo;

  // Prepare request payload
  const payload = {
    text: text,
    model_id: modelId,
    voice_settings: STORYTELLING_VOICE_SETTINGS
  };

  console.log('[TTS Service] Calling ElevenLabs API...');
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TTS Service] ElevenLabs API Error:', response.status, errorText);
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  console.log('[TTS Service] ElevenLabs response received, uploading to storage...');

  // Get audio data as array buffer
  const audioBuffer = await response.arrayBuffer();
  const audioData = new Uint8Array(audioBuffer);

  // Upload to Supabase Storage
  return await uploadAudioToStorage(audioData, voiceId);
}

async function generateFallbackAudio(text: string, voiceValue: string): Promise<string> {
  console.log('[TTS Service] Using fallback audio generation');

  // For development/fallback: use browser's Speech Synthesis API or return a placeholder
  // In production, you might want to integrate with AWS Polly, Google TTS, or Azure Speech
  
  try {
    // Option 1: Generate using AWS Polly (if configured)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      return await generateAWSPollyAudio(text, voiceValue);
    }

    // Option 2: Return a placeholder URL with a note
    console.log('[TTS Service] No fallback TTS configured, using placeholder');
    return await createPlaceholderAudio(text, voiceValue);

  } catch (error) {
    console.error('[TTS Service] Fallback TTS failed:', error);
    return await createPlaceholderAudio(text, voiceValue);
  }
}

async function generateAWSPollyAudio(text: string, voiceValue: string): Promise<string> {
  // AWS Polly integration (uncomment and configure if needed)
  /*
  const AWS = require('aws-sdk');
  
  const polly = new AWS.Polly({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  // Map voice values to Polly voices
  const pollyVoices = {
    'default-en-male': 'Matthew',
    'default-en-female': 'Joanna',
    'default-id-male': 'Arlet',  // Indonesian
    'default-id-female': 'Arlet', // Limited Indonesian options
  };

  const voiceName = pollyVoices[voiceValue] || 'Joanna';
  const isIndonesian = voiceValue.includes('-id-');

  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voiceName,
    LanguageCode: isIndonesian ? 'id-ID' : 'en-US',
    Engine: 'neural', // Use neural voices for better quality
  };

  const result = await polly.synthesizeSpeech(params).promise();
  return await uploadAudioToStorage(result.AudioStream, voiceValue);
  */
  
  // Placeholder for now
  throw new Error('AWS Polly not configured');
}

async function createPlaceholderAudio(text: string, voiceValue: string): Promise<string> {
  console.log('[TTS Service] Creating placeholder audio entry');
  
  // For development: return a placeholder audio URL or generate a simple audio file
  // You could also integrate with free TTS services like:
  // - ResponsiveVoice API
  // - SpeechSynthesis API (browser-based)
  // - Festival TTS (open source)
  
  // Return a placeholder that indicates the text content
  const placeholderUrl = `https://via.placeholder.com/audio.mp3?text=${encodeURIComponent(text.substring(0, 50))}`;
  
  // Or upload a simple "audio placeholder" file to storage
  const supabase = createServiceRoleClient();
  const fileName = `audio/placeholder-${Date.now()}.txt`;
  
  const { data, error } = await supabase.storage
    .from('stories')
    .upload(fileName, JSON.stringify({
      message: 'Audio generation placeholder',
      text: text,
      voice: voiceValue,
      timestamp: new Date().toISOString()
    }), {
      contentType: 'application/json'
    });

  if (error) {
    console.error('[TTS Service] Error uploading placeholder:', error);
    return placeholderUrl;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('stories')
    .getPublicUrl(fileName);

  return publicUrl;
}

async function uploadAudioToStorage(audioData: Uint8Array, voiceId: string): Promise<string> {
  console.log('[TTS Service] Uploading audio to Supabase Storage...');
  
  const supabase = createServiceRoleClient();
  const fileName = `audio/${Date.now()}-${voiceId}.mp3`;
  
  const { data, error } = await supabase.storage
    .from('stories')
    .upload(fileName, audioData, {
      contentType: 'audio/mpeg',
      upsert: true
    });

  if (error) {
    console.error('[TTS Service] Storage upload error:', error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('stories')
    .getPublicUrl(fileName);

  console.log('[TTS Service] Audio uploaded successfully:', publicUrl);
  return publicUrl;
}

// Voice optimization for different content types
export function optimizeVoiceSettings(contentType: 'story' | 'dialogue' | 'narration'): VoiceSettings {
  const baseSettings = { ...STORYTELLING_VOICE_SETTINGS };
  
  switch (contentType) {
    case 'dialogue':
      return {
        ...baseSettings,
        stability: 0.6,      // More dynamic for character voices
        similarity_boost: 0.9, // Higher similarity for character consistency
        style: 0.7,          // More expressive
      };
    
    case 'narration':
      return {
        ...baseSettings,
        stability: 0.8,      // Very stable for consistent narration
        similarity_boost: 0.7, // Slightly lower for natural flow
        style: 0.3,          // Less dramatic, more natural
      };
    
    case 'story':
    default:
      return baseSettings;
  }
}

// Helper function to split long text for TTS
export function splitTextForTTS(text: string, maxLength: number = 5000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    const sentenceWithPunctuation = trimmedSentence + '.';
    
    if ((currentChunk + sentenceWithPunctuation).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
    
    currentChunk += sentenceWithPunctuation + ' ';
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

// Enhanced audio generation with chunking for long stories
export async function generateAudioWithChunking(text: string, voiceValue: string): Promise<string> {
  const chunks = splitTextForTTS(text);
  
  if (chunks.length === 1) {
    return await generateAudio(text, voiceValue);
  }

  console.log(`[TTS Service] Generating audio in ${chunks.length} chunks...`);
  
  // Generate audio for each chunk
  const audioUrls: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`[TTS Service] Processing chunk ${i + 1}/${chunks.length}`);
    const chunkAudio = await generateAudio(chunks[i], voiceValue);
    audioUrls.push(chunkAudio);
  }

  // TODO: Combine audio files into a single file
  // For now, return the first chunk's URL
  // In production, you'd want to concatenate the audio files
  console.log('[TTS Service] Multiple chunks generated, returning first chunk');
  return audioUrls[0];
}