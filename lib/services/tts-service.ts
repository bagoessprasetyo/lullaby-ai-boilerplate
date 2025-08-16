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
  turbo: 'eleven_multilingual_v2',           // Fastest, good quality
  multilingual: 'eleven_multilingual_v2', // Best for non-English
  standard: 'eleven_multilingual_v2'   // Highest quality English
};

export async function generateAudio(text: string, voiceValue: string, language?: string): Promise<string> {
  console.log('[TTS Service] Starting audio generation...');
  console.log('[TTS Service] Voice:', voiceValue);
  console.log('[TTS Service] Language:', language);
  console.log('[TTS Service] Text length:', text.length);

  try {
    // Only use ElevenLabs - no fallback to other services
    console.log('[TTS Service] Using ElevenLabs for voice:', voiceValue);
    return await generateElevenLabsAudio(text, voiceValue, language);

  } catch (error: any) {
    console.error('[TTS Service] ElevenLabs TTS failed:', error);
    // Don't fallback to other services - throw the error to be handled upstream
    throw new Error(`ElevenLabs TTS generation failed: ${error.message}`);
  }
}

// Map default voice IDs to actual ElevenLabs voice IDs
function mapVoiceId(voiceId: string): string {
  const voiceMapping = {
    'default-en-male': 'LruHrtVF6PSyGItzMNHS',     // English male
    'default-en-female': 'i4CzbCVWoqvD0P1QJCUL',   // English female
    'default-id-male': 'J7W4tJ2vGkG943akMc1X',     // Indonesian male
    'default-id-female': 'iWydkXKoiVtvdn4vLKp9'    // Indonesian female
  };
  
  return voiceMapping[voiceId] || voiceId;
}

// Map language to ElevenLabs language code
function mapLanguageCode(language?: string): string {
  const languageCodeMap: Record<string, string> = {
    'en': 'en',
    'id': 'id',
    'fr': 'fr',
    'ja': 'ja',
    'english': 'en',
    'indonesian': 'id',
    'french': 'fr',
    'japanese': 'ja'
  };
  
  if (!language) return 'en'; // Default to English
  return languageCodeMap[language.toLowerCase()] || 'en';
}

// Clean text for TTS generation by removing problematic characters
function cleanTextForTTS(text: string): string {
  return text
    .replace(/[*#]/g, '')           // Remove asterisk and hash characters
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .trim();                        // Remove leading/trailing whitespace
}

async function generateElevenLabsAudio(text: string, voiceId: string, language?: string): Promise<string> {
  // Clean text for TTS generation
  const cleanedText = cleanTextForTTS(text);
  
  // Map voice ID to actual ElevenLabs voice ID
  const actualVoiceId = mapVoiceId(voiceId);
  console.log('[TTS Service] Original voice ID:', voiceId);
  console.log('[TTS Service] Mapped voice ID:', actualVoiceId);
  console.log('[TTS Service] Language:', language);
  console.log('[TTS Service] Original text length:', text.length);
  console.log('[TTS Service] Cleaned text length:', cleanedText.length);
  console.log('[TTS Service] Text preview:', cleanedText.substring(0, 100) + '...');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Validate voice ID format
  if (!actualVoiceId || actualVoiceId.length < 10) {
    throw new Error(`Invalid ElevenLabs voice ID: ${actualVoiceId}`);
  }

  // Map language to language code
  const languageCode = mapLanguageCode(language);
  
  // Determine language and model
  const isIndonesian = language === 'id' || language === 'indonesian' || cleanedText.includes('Pada suatu ketika') || cleanedText.includes('Tamat.');
  const modelId = isIndonesian ? TTS_MODELS.multilingual : TTS_MODELS.turbo;

  // Prepare request payload
  const payload = {
    text: cleanedText,
    model_id: modelId,
    voice_settings: STORYTELLING_VOICE_SETTINGS
  };

  console.log('[TTS Service] Request payload:', {
    textLength: cleanedText.length,
    voiceId: actualVoiceId,
    modelId,
    voice_settings: STORYTELLING_VOICE_SETTINGS
  });
  console.log('[TTS Service] Calling ElevenLabs API...');
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`, {
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
    console.error('[TTS Service] ElevenLabs API Error:', {
      status: response.status,
      statusText: response.statusText,
      errorText,
      voiceId: actualVoiceId,
      modelId
    });
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  console.log('[TTS Service] ElevenLabs response received successfully');
  console.log('[TTS Service] Response headers:', Object.fromEntries(response.headers.entries()));

  // Get audio data as array buffer
  const audioBuffer = await response.arrayBuffer();
  const audioData = new Uint8Array(audioBuffer);
  
  console.log('[TTS Service] Audio data received:', {
    size: audioData.length,
    sizeKB: Math.round(audioData.length / 1024)
  });

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
export async function generateAudioWithChunking(text: string, voiceValue: string, language?: string): Promise<string> {
  console.log('[TTS Service] Starting chunked audio generation...');
  
  // For shorter texts, use direct generation
  if (text.length <= 2500) {
    return await generateAudio(text, voiceValue, language);
  }

  const chunks = splitTextForTTS(text);
  console.log(`[TTS Service] Generating audio in ${chunks.length} chunks...`);
  
  // Generate audio for each chunk
  const audioUrls: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`[TTS Service] Processing chunk ${i + 1}/${chunks.length}`);
    const chunkAudio = await generateAudio(chunks[i], voiceValue, language);
    audioUrls.push(chunkAudio);
  }

  // TODO: Combine audio files into a single file
  // For now, return the first chunk's URL
  // In production, you'd want to concatenate the audio files
  console.log('[TTS Service] Multiple chunks generated, returning first chunk');
  return audioUrls[0];
}