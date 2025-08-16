// lib/services/story-generation.ts
import { createServiceRoleClient } from '@/lib/supabase/admin';
import OpenAI from 'openai';

interface StoryData {
  theme: string;
  characters: Array<{ name: string; description: string }>;
  language: string;
  voice: string;
  duration?: string;
  uploadedImages?: string[];
  targetAge?: string;
  customPrompt?: string;
}

interface ImageAnalysis {
  description: string;
  characters?: string[];
  setting?: string;
  mood?: string;
  objects?: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateStoryAsync(storyId: string, storyData: StoryData) {
  const supabase = createServiceRoleClient();
  
  console.log('[Story Generation] Starting generation for story:', storyId, 'with data:', storyData);
  
  try {
    // Step 1: Update status to generating
    await updateStoryStatus(storyId, 'generating', 10, 'analyzing-images');
    
    // Step 2: Analyze uploaded images if any
    let imageAnalyses: ImageAnalysis[] = [];
    if (storyData.uploadedImages && storyData.uploadedImages.length > 0) {
      console.log('[Story Generation] Analyzing uploaded images...');
      imageAnalyses = await analyzeUploadedImages(storyData.uploadedImages);
      await updateStoryStatus(storyId, 'generating', 25, 'generating-title');
    }
    
    // Step 3: Generate story title
    const storyTitle = await generateStoryTitle(storyData, imageAnalyses);
    await updateStoryStatus(storyId, 'generating', 35, 'story-generation');
    
    // Step 4: Generate story text using OpenAI
    const storyText = await generateStoryText(storyData, imageAnalyses);
    await updateStoryStatus(storyId, 'generating', 60, 'audio-generation');

    // Step 5: Generate audio using ElevenLabs
    const audioUrl = await generateAudio(storyText, storyData.voice, storyData.language);
    await updateStoryStatus(storyId, 'generating', 85, 'finalizing');

    // Step 6: Update images table with full URLs
    if (storyData.uploadedImages && storyData.uploadedImages.length > 0) {
      await updateImageRecords(storyId, storyData.uploadedImages);
    }

    // Step 7: Save completed story
    await updateStoryStatus(storyId, 'generating', 95, 'saving');
    
    const { error: updateError } = await supabase
      .from('stories')
      .update({
        title: storyTitle,
        text_content: storyText,
        audio_url: audioUrl,
        generation_status: 'completed',
        generation_progress: 100,
        current_step: 'completed'
      })
      .eq('id', storyId);

    if (updateError) {
      throw new Error(`Failed to save story: ${updateError.message}`);
    }

    console.log('[Story Generation] Completed story generation for:', storyId);

  } catch (error: any) {
    console.error('[Story Generation] Error generating story:', error);
    
    // Log the full error for debugging
    console.error('[Story Generation] Full error details:', {
      message: error.message,
      stack: error.stack,
      storyId,
      storyData
    });
    
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

async function analyzeUploadedImages(imageUrls: string[]): Promise<ImageAnalysis[]> {
  console.log('[Story Generation] Analyzing', imageUrls.length, 'images with OpenAI Vision...');
  
  const analyses: ImageAnalysis[] = [];
  
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      console.log(`[Story Generation] Analyzing image ${i + 1}/${imageUrls.length}:`, imageUrls[i]);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing images for children's story creation. Analyze the image and provide detailed information that can be used to create an engaging bedtime story.

Return your analysis in this JSON format:
{
  "description": "Detailed description of what you see in the image",
  "characters": ["list", "of", "potential", "characters"],
  "setting": "description of the location or environment",
  "mood": "overall mood or atmosphere",
  "objects": ["notable", "objects", "or", "items"]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this image for creating a children's bedtime story. Focus on characters, setting, mood, and story elements that would make a great story for kids."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrls[i],
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const analysisText = response.choices[0]?.message?.content;
      if (analysisText) {
        try {
          // Try to parse as JSON first
          const parsedAnalysis = JSON.parse(analysisText);
          analyses.push(parsedAnalysis);
        } catch (parseError) {
          // If JSON parsing fails, create analysis from text
          analyses.push({
            description: analysisText,
            characters: [],
            setting: "",
            mood: "",
            objects: []
          });
        }
      }
      
      console.log(`[Story Generation] Image ${i + 1} analysis completed`);
      
    } catch (error: any) {
      console.error(`[Story Generation] Error analyzing image ${i + 1}:`, error);
      // Continue with other images even if one fails
      analyses.push({
        description: "Unable to analyze this image",
        characters: [],
        setting: "",
        mood: "",
        objects: []
      });
    }
  }
  
  console.log('[Story Generation] Image analysis completed. Analyses:', analyses);
  return analyses;
}

async function generateStoryTitle(storyData: StoryData, imageAnalyses: ImageAnalysis[]): Promise<string> {
  console.log('[Story Generation] Generating story title...');
  
  try {
    const { theme, characters, language, targetAge } = storyData;
    const imageContext = imageAnalyses.length > 0 
      ? `Based on uploaded images showing: ${imageAnalyses.map(a => a.description).join(', ')}`
      : '';
    
    const characterNames = characters.map(c => c.name).filter(Boolean);
    const mainCharacter = characterNames[0] || 'the main character';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a creative title generator for children's bedtime stories. Create engaging, age-appropriate titles that capture the essence of the story.

For ${language === 'id' ? 'Indonesian' : 'English'} language.
Target age: ${getAgeGroupDescription(getAgeGroup(targetAge), language)}

Return only the title, nothing else.`
        },
        {
          role: "user",
          content: `Create a captivating title for a ${theme} bedtime story featuring ${mainCharacter}${characterNames.length > 1 ? ` and friends (${characterNames.slice(1).join(', ')})` : ''}.

${imageContext}

Theme: ${theme}
Characters: ${characterNames.join(', ') || 'To be determined'}
${storyData.customPrompt ? `Special elements: ${storyData.customPrompt}` : ''}

Generate a title that would excite children and make them want to hear the story.`
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    const title = response.choices[0]?.message?.content?.trim();
    
    if (!title) {
      // Fallback title generation
      const fallbackTitle = generateFallbackTitle(storyData, imageAnalyses);
      console.log('[Story Generation] Using fallback title:', fallbackTitle);
      return fallbackTitle;
    }
    
    console.log('[Story Generation] Generated title:', title);
    return title;
    
  } catch (error: any) {
    console.error('[Story Generation] Error generating title:', error);
    return generateFallbackTitle(storyData, imageAnalyses);
  }
}

function generateFallbackTitle(storyData: StoryData, imageAnalyses: ImageAnalysis[]): string {
  const { theme, characters } = storyData;
  const mainCharacter = characters[0]?.name || 'Our Friend';
  
  const templates = {
    en: [
      `${mainCharacter}'s ${theme} Adventure`,
      `The ${theme} Story of ${mainCharacter}`,
      `${mainCharacter} and the ${theme} Mystery`,
      `A ${theme} Tale`
    ],
    id: [
      `Petualangan ${theme} ${mainCharacter}`,
      `Cerita ${theme} ${mainCharacter}`,
      `${mainCharacter} dan Misteri ${theme}`,
      `Kisah ${theme}`
    ]
  };
  
  const titleTemplates = templates[storyData.language as keyof typeof templates] || templates.en;
  return titleTemplates[0];
}

async function generateStoryText(storyData: StoryData, imageAnalyses: ImageAnalysis[]): Promise<string> {
  console.log('[Story Generation] Generating story text with OpenAI...');
  
  try {
    const prompt = buildEnhancedStoryPrompt(storyData, imageAnalyses);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(storyData.language, storyData.targetAge)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: getMaxTokensForDuration(storyData.duration, storyData.targetAge),
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });

    const generatedStory = completion.choices[0]?.message?.content;
    
    if (!generatedStory) {
      throw new Error('No story content generated by OpenAI');
    }

    console.log('[Story Generation] OpenAI story generated successfully, length:', generatedStory.length);
    
    // Validate word count
    const wordCount = generatedStory.trim().split(/\s+/).length;
    const minWords = getMinWordCount(storyData.duration);
    
    if (wordCount < minWords) {
      console.log(`[Story Generation] Story too short (${wordCount} words, need ${minWords}), extending...`);
      return await extendStory(generatedStory, storyData, minWords - wordCount);
    }
    
    return generatedStory.trim();

  } catch (error: any) {
    console.error('[Story Generation] OpenAI API Error:', error);
    
    // Fallback to template-based generation if OpenAI fails
    console.log('[Story Generation] Falling back to template generation...');
    return generateTemplateStory(storyData, imageAnalyses);
  }
}

function buildEnhancedStoryPrompt(storyData: StoryData, imageAnalyses: ImageAnalysis[]): string {
  const { theme, characters, language, duration, customPrompt, targetAge } = storyData;
  const ageGroup = getAgeGroup(targetAge);
  
  // Build image context
  const imageContext = imageAnalyses.length > 0 ? `
**UPLOADED IMAGES ANALYSIS**:
${imageAnalyses.map((analysis, i) => `
Image ${i + 1}: ${analysis.description}
- Characters spotted: ${analysis.characters?.join(', ') || 'None specified'}
- Setting: ${analysis.setting || 'Not specified'}
- Mood: ${analysis.mood || 'Not specified'}
- Notable objects: ${analysis.objects?.join(', ') || 'None specified'}
`).join('')}

**IMPORTANT**: Incorporate elements from these images into your story. The images were provided by the user and should inspire key story elements.` : '';

  // Build character section
  const characterSection = characters.length > 0 
    ? `**CHARACTERS**:
${characters.map((char, i) => `${i + 1}. ${char.name}: ${char.description}`).join('\n')}

Make ${characters[0]?.name || 'the main character'} the protagonist.`
    : '**CHARACTERS**: Create 2-3 engaging characters appropriate for the age group.';

  // Word count requirements
  const wordCountGuidance = `
**WORD COUNT REQUIREMENT**: 
- Short story: Minimum 300 words
- Medium story: Minimum 600 words  
- Long story: Minimum 900 words
Current request: ${duration || 'medium'} story - write at least ${getMinWordCount(duration)} words.`;

  const prompt = `Create a ${theme} bedtime story with the following requirements:

**TARGET AUDIENCE**: ${getAgeGroupDescription(ageGroup, language)}
**THEME**: ${theme}
**LANGUAGE**: ${language === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}

${imageContext}

${characterSection}

${wordCountGuidance}

**SPECIAL REQUIREMENTS**:
${customPrompt ? `- ${customPrompt}` : '- None specified'}

**STORY STRUCTURE**:
- Engaging opening that hooks the audience
- Clear story arc with ${getConflictComplexity(ageGroup)}
- Rich descriptions that bring the story to life
- Natural dialogue between characters
- ${getThematicElements(ageGroup)}
- ${getEndingStyle(ageGroup)}

**WRITING STYLE**:
- Use ${getVocabularyGuidance(ageGroup)}
- Write in flowing, natural sentences perfect for reading aloud
- Include sensory details (what characters see, hear, feel)
- Maintain ${getAppropriateSpace(ageGroup)} throughout the story

Write the complete story now. Remember to meet the minimum word count requirement.`;

  return prompt;
}

function getMinWordCount(duration?: string): number {
  const wordCounts = {
    'short': 300,
    'medium': 600,
    'long': 900
  };
  
  return wordCounts[duration as keyof typeof wordCounts] || wordCounts.medium;
}

async function extendStory(originalStory: string, storyData: StoryData, additionalWords: number): Promise<string> {
  console.log(`[Story Generation] Extending story by approximately ${additionalWords} words...`);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are tasked with extending a children's bedtime story. Add approximately ${additionalWords} more words while maintaining the same style, tone, and quality. The extension should flow naturally and enhance the story.`
        },
        {
          role: "user",
          content: `Please extend this story by adding more descriptive details, character development, or plot elements. The extension should flow seamlessly with the existing content.

Current story:
${originalStory}

Add approximately ${additionalWords} more words while keeping the same ${storyData.language === 'id' ? 'Indonesian' : 'English'} language and ${storyData.theme} theme.`
        }
      ],
      max_tokens: Math.ceil(additionalWords * 1.5), // Token buffer
      temperature: 0.7
    });

    const extendedStory = response.choices[0]?.message?.content;
    
    if (extendedStory) {
      console.log('[Story Generation] Story extended successfully');
      return extendedStory.trim();
    }
    
  } catch (error) {
    console.error('[Story Generation] Error extending story:', error);
  }
  
  // If extension fails, return original story
  return originalStory;
}

async function updateImageRecords(storyId: string, imageUrls: string[]) {
  console.log('[Story Generation] Updating image records with full URLs...');
  
  const supabase = createServiceRoleClient();
  
  try {
    // Get existing image records for this story
    const { data: existingImages, error: fetchError } = await supabase
      .from('images')
      .select('id, sequence_index')
      .eq('story_id', storyId)
      .order('sequence_index', { ascending: true });

    if (fetchError) {
      console.error('[Story Generation] Error fetching existing images:', fetchError);
      return;
    }

    // Update each image record with the full URL
    for (let i = 0; i < imageUrls.length && i < (existingImages?.length || 0); i++) {
      const imageRecord = existingImages?.[i];
      if (imageRecord) {
        const { error: updateError } = await supabase
          .from('images')
          .update({
            full_url: imageUrls[i],
            updated_at: new Date().toISOString()
          })
          .eq('id', imageRecord.id);

        if (updateError) {
          console.error(`[Story Generation] Error updating image ${i + 1}:`, updateError);
        } else {
          console.log(`[Story Generation] Updated image ${i + 1} with full URL`);
        }
      }
    }
    
  } catch (error) {
    console.error('[Story Generation] Error updating image records:', error);
  }
}

// Import audio generation function
async function generateAudio(text: string, voice: string, language?: string): Promise<string> {
  console.log('[Story Generation] Generating audio...');
  
  // Import the TTS service
  const { generateAudio: generateTTS } = await import('./tts-service');
  return await generateTTS(text, voice, language);
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
      current_step: step,
      updated_at: new Date().toISOString()
    })
    .eq('id', storyId);

  if (error) {
    console.error('[Story Generation] Error updating status:', error);
    throw error;
  }
}

// Helper functions (keeping existing implementations)
function getSystemPrompt(language: string, targetAge?: string): string {
  const ageGroup = getAgeGroup(targetAge);
  
  const prompts = {
    en: {
      'toddler': `You are a master storyteller specializing in very simple, repetitive bedtime stories for toddlers (ages 2-4). Your stories should be:

- Extremely simple with repetitive phrases and predictable patterns
- Focus on basic concepts: colors, shapes, animals, family
- Very short sentences with simple vocabulary
- Repetitive, soothing rhythm perfect for very young children
- No complex plot - simple cause and effect
- Familiar, safe environments (home, park, farm)
- Include sounds and actions toddlers can imitate
- End with sleeping/resting themes
- Maximum 2-3 characters to avoid confusion

Write at least 300 words. Format with very short paragraphs and natural pauses for a calm reading pace.`,

      'preschool': `You are a master storyteller specializing in engaging yet calming bedtime stories for preschoolers (ages 3-5). Your stories should be:

- Age-appropriate with simple vocabulary and clear storylines
- Educational with basic lessons about sharing, kindness, and friendship
- Include familiar scenarios: family, pets, neighborhood, preschool
- Simple problem-solving that children can understand
- Gentle emotions and conflicts with easy resolutions
- Interactive elements like counting, colors, or animal sounds
- Encourage imagination while staying relatable
- End peacefully to prepare for sleep

Write at least 600 words for medium stories. Format with clear paragraph breaks and engaging dialogue.`,

      'early-elementary': `You are a master storyteller specializing in imaginative bedtime stories for early elementary children (ages 5-7). Your stories should be:

- More complex vocabulary while remaining accessible
- Include adventure and exploration within safe boundaries
- Teach problem-solving, cooperation, and empathy
- Feature diverse characters and settings
- Include mild challenges that characters overcome through creativity
- Incorporate learning elements: nature, science, friendship
- Balance excitement with calming conclusions
- Build confidence and curiosity

Write at least 600-900 words depending on story length. Structure with engaging dialogue and descriptive but not overwhelming detail.`,

      'elementary': `You are a master storyteller creating rich, imaginative bedtime stories for elementary children (ages 6-10). Your stories should be:

- Sophisticated vocabulary and more complex narratives
- Multi-layered themes about courage, friendship, and personal growth
- Include diverse settings and cultures
- Feature meaningful conflicts and character development
- Incorporate subtle life lessons and moral reasoning
- Encourage critical thinking and empathy
- Balance adventure with emotional intelligence
- End with reflection and peaceful resolution

Write 900+ words for longer stories. Create vivid scenes with engaging character interactions and thoughtful pacing.`,

      'mixed': `You are a master storyteller creating versatile bedtime stories suitable for mixed age groups (ages 3-10). Your stories should be:

- Multi-layered: simple enough for younger children, engaging for older ones
- Universal themes that resonate across age groups
- Clear, beautiful language that flows at different comprehension levels
- Visual and interactive elements for younger listeners
- Deeper meaning and character development for older children
- Inclusive scenarios that speak to various developmental stages
- Calming progression that works for all bedtime routines

Write 600+ words. Balance simplicity with richness to engage the whole family.`
    },

    id: {
      'toddler': `Anda adalah seorang pencerita ahli yang mengkhususkan diri dalam cerita pengantar tidur yang sangat sederhana dan berulang untuk balita (usia 2-4 tahun). Cerita Anda harus:

- Sangat sederhana dengan frasa berulang dan pola yang dapat diprediksi
- Fokus pada konsep dasar: warna, bentuk, hewan, keluarga
- Kalimat sangat pendek dengan kosakata sederhana
- Ritme berulang yang menenangkan sempurna untuk anak-anak sangat kecil
- Tidak ada plot kompleks - sebab dan akibat sederhana
- Lingkungan yang familiar dan aman (rumah, taman, peternakan)
- Sertakan suara dan tindakan yang bisa ditiru balita
- Berakhir dengan tema tidur/istirahat
- Maksimal 2-3 karakter untuk menghindari kebingungan

Tulis minimal 300 kata. Format dengan paragraf sangat pendek dan jeda alami untuk kecepatan membaca yang tenang.`,

      'preschool': `Anda adalah seorang pencerita ahli yang mengkhususkan diri dalam cerita pengantar tidur yang menarik namun menenangkan untuk anak prasekolah (usia 3-5 tahun). Cerita Anda harus:

- Sesuai usia dengan kosakata sederhana dan alur cerita yang jelas
- Edukatif dengan pelajaran dasar tentang berbagi, kebaikan, dan persahabatan
- Sertakan skenario familiar: keluarga, hewan peliharaan, lingkungan, prasekolah
- Pemecahan masalah sederhana yang bisa dipahami anak-anak
- Emosi dan konflik lembut dengan resolusi mudah
- Elemen interaktif seperti menghitung, warna, atau suara hewan
- Dorong imajinasi sambil tetap relatable
- Berakhir dengan damai untuk persiapan tidur

Tulis minimal 600 kata untuk cerita sedang. Format dengan jeda paragraf yang jelas dan dialog yang menarik.`,

      'early-elementary': `Anda adalah seorang pencerita ahli yang mengkhususkan diri dalam cerita pengantar tidur yang imajinatif untuk anak-anak sekolah dasar awal (usia 5-7 tahun). Cerita Anda harus:

- Kosakata lebih kompleks namun tetap dapat diakses
- Sertakan petualangan dan eksplorasi dalam batas-batas aman
- Ajarkan pemecahan masalah, kerjasama, dan empati
- Tampilkan karakter dan setting yang beragam
- Sertakan tantangan ringan yang diatasi karakter melalui kreativitas
- Masukkan elemen pembelajaran: alam, sains, persahabatan
- Seimbangkan kegembiraan dengan kesimpulan yang menenangkan
- Bangun kepercayaan diri dan rasa ingin tahu

Tulis minimal 600-900 kata tergantung panjang cerita. Struktur dengan dialog yang menarik dan detail deskriptif namun tidak berlebihan.`,

      'elementary': `Anda adalah seorang pencerita yang menciptakan cerita pengantar tidur yang kaya dan imajinatif untuk anak-anak sekolah dasar (usia 6-10 tahun). Cerita Anda harus:

- Kosakata yang canggih dan narasi yang lebih kompleks
- Tema berlapis tentang keberanian, persahabatan, dan pertumbuhan pribadi
- Sertakan setting dan budaya yang beragam
- Tampilkan konflik bermakna dan pengembangan karakter
- Masukkan pelajaran hidup yang halus dan penalaran moral
- Dorong pemikiran kritis dan empati
- Seimbangkan petualangan dengan kecerdasan emosional
- Berakhir dengan refleksi dan resolusi damai

Tulis 900+ kata untuk cerita panjang. Buat adegan yang hidup dengan interaksi karakter yang menarik dan pacing yang thoughtful.`,

      'mixed': `Anda adalah seorang pencerita ahli yang menciptakan cerita pengantar tidur serbaguna yang cocok untuk kelompok usia campuran (usia 3-10 tahun). Cerita Anda harus:

- Multi-layered: cukup sederhana untuk anak kecil, menarik untuk yang lebih besar
- Tema universal yang beresonansi di berbagai kelompok usia
- Bahasa yang jelas dan indah mengalir di berbagai tingkat pemahaman
- Elemen visual dan interaktif untuk pendengar yang lebih muda
- Makna dan pengembangan karakter yang lebih dalam untuk anak yang lebih besar
- Skenario inklusif yang berbicara pada berbagai tahap perkembangan
- Progresi yang menenangkan yang bekerja untuk semua rutinas tidur

Tulis minimal 600 kata. Seimbangkan kesederhanaan dengan kekayaan untuk melibatkan seluruh keluarga.`
    }
  };

  return prompts[language as keyof typeof prompts]?.[ageGroup] || prompts.en.mixed;
}

function getAgeGroup(targetAge?: string): string {
  if (!targetAge) return 'mixed';
  
  if (targetAge === '2-4') return 'toddler';
  if (targetAge === '3-5') return 'preschool';
  if (targetAge === '5-7') return 'early-elementary';
  if (targetAge === '6-10') return 'elementary';
  
  return 'mixed';
}

function getAgeGroupDescription(ageGroup: string, language: string): string {
  const descriptions = {
    'toddler': { 'en': 'Toddlers (ages 2-4)', 'id': 'Balita (usia 2-4 tahun)' },
    'preschool': { 'en': 'Preschoolers (ages 3-5)', 'id': 'Anak prasekolah (usia 3-5 tahun)' },
    'early-elementary': { 'en': 'Early Elementary (ages 5-7)', 'id': 'Sekolah dasar awal (usia 5-7 tahun)' },
    'elementary': { 'en': 'Elementary (ages 6-10)', 'id': 'Sekolah dasar (usia 6-10 tahun)' },
    'mixed': { 'en': 'Mixed age groups (ages 3-10)', 'id': 'Kelompok usia campuran (usia 3-10 tahun)' }
  };

  return descriptions[ageGroup]?.[language] || descriptions.mixed[language] || descriptions.mixed.en;
}

function getMaxTokensForDuration(duration?: string, targetAge?: string): number {
  const ageGroup = getAgeGroup(targetAge);
  
  const tokenLimits = {
    'toddler': {
      'short': 500,   // ~300-400 words
      'medium': 800,  // ~600-700 words
      'long': 1200    // ~900-1000 words
    },
    'preschool': {
      'short': 500,
      'medium': 1000, // ~600-800 words
      'long': 1400    // ~900-1200 words
    },
    'early-elementary': {
      'short': 600,
      'medium': 1200, // ~600-900 words
      'long': 1600    // ~900-1300 words
    },
    'elementary': {
      'short': 700,
      'medium': 1400, // ~600-1000 words
      'long': 2000    // ~900-1500 words
    },
    'mixed': {
      'short': 600,
      'medium': 1200,
      'long': 1600
    }
  };
  
  const durationKey = duration || 'medium';
  const ageTokens = tokenLimits[ageGroup] || tokenLimits.mixed;
  
  return ageTokens[durationKey as keyof typeof ageTokens] || ageTokens.medium;
}

function generateTemplateStory(storyData: StoryData, imageAnalyses: ImageAnalysis[]): string {
  // Enhanced fallback template with image context
  const { theme, characters, language, duration } = storyData;
  const mainCharacter = characters[0]?.name || 'Alex';
  const characterNames = characters.map(c => c.name).join(', ');
  
  // Use image context if available
  const imageContext = imageAnalyses.length > 0 
    ? `In the story, we see ${imageAnalyses.map(a => a.description).join(', ')}.`
    : '';
  
  const minWords = getMinWordCount(duration);
  
  // Generate appropriate length template
  const templates = {
    en: generateEnglishTemplate(mainCharacter, characterNames, theme, imageContext, minWords),
    id: generateIndonesianTemplate(mainCharacter, characterNames, theme, imageContext, minWords)
  };

  return templates[language as keyof typeof templates] || templates.en;
}

function generateEnglishTemplate(mainCharacter: string, characterNames: string, theme: string, imageContext: string, minWords: number): string {
  const baseStory = `Once upon a time, in a magical ${theme} world, there lived a brave and kind character named ${mainCharacter}.

${imageContext}

${characterNames ? `Together with their wonderful friends ${characterNames}, ` : ''}${mainCharacter} discovered something truly special that would change their understanding of the world.

As they embarked on their ${theme} journey, ${mainCharacter} learned important lessons about courage, friendship, and believing in themselves. Every challenge they faced only made them stronger and wiser.

The adventure was filled with wonder and discovery, leading to a heartwarming moment where ${mainCharacter} realized that the greatest treasures in life are the friends we make and the kindness we share.

As the stars began to twinkle in the evening sky, ${mainCharacter} felt grateful for their amazing day and drifted off to sleep with a smile, dreaming of tomorrow's possibilities.

And they all lived happily ever after.

The End.`;

  // Extend if needed to meet word count
  const currentWords = baseStory.split(/\s+/).length;
  if (currentWords < minWords) {
    return baseStory + `\n\n${generateAdditionalContent(mainCharacter, theme, minWords - currentWords)}`;
  }
  
  return baseStory;
}

function generateIndonesianTemplate(mainCharacter: string, characterNames: string, theme: string, imageContext: string, minWords: number): string {
  const baseStory = `Pada suatu ketika, di dunia ${theme} yang ajaib, hiduplah seorang karakter yang berani dan baik hati bernama ${mainCharacter}.

${imageContext}

${characterNames ? `Bersama dengan teman-teman indah mereka ${characterNames}, ` : ''}${mainCharacter} menemukan sesuatu yang benar-benar istimewa yang akan mengubah pemahaman mereka tentang dunia.

Saat mereka memulai perjalanan ${theme} mereka, ${mainCharacter} belajar pelajaran penting tentang keberanian, persahabatan, dan percaya pada diri sendiri. Setiap tantangan yang mereka hadapi hanya membuat mereka lebih kuat dan bijaksana.

Petualangan itu penuh dengan keajaiban dan penemuan, mengarah pada momen yang mengharukan di mana ${mainCharacter} menyadari bahwa harta terbesar dalam hidup adalah teman-teman yang kita buat dan kebaikan yang kita bagikan.

Saat bintang-bintang mulai berkedip di langit malam, ${mainCharacter} merasa bersyukur atas hari yang luar biasa dan tertidur dengan senyuman, bermimpi tentang kemungkinan-kemungkinan hari esok.

Dan mereka semua hidup bahagia selamanya.

Tamat.`;

  const currentWords = baseStory.split(/\s+/).length;
  if (currentWords < minWords) {
    return baseStory + `\n\n${generateAdditionalContent(mainCharacter, theme, minWords - currentWords, 'id')}`;
  }
  
  return baseStory;
}

function generateAdditionalContent(character: string, theme: string, additionalWords: number, language: string = 'en'): string {
  if (language === 'id') {
    return `Dalam perjalanan mereka, ${character} dan teman-temannya mengalami banyak hal menakjubkan. Mereka belajar tentang pentingnya saling membantu dan selalu bersikap baik kepada semua makhluk yang mereka temui. Setiap hari membawa petualangan baru dan pelajaran berharga yang akan mereka ingat selamanya.`;
  }
  
  return `During their journey, ${character} and their friends experienced many wonderful things. They learned about the importance of helping each other and always being kind to all the creatures they met. Each day brought new adventures and valuable lessons that they would remember forever.`;
}

function getConflictComplexity(ageGroup: string): string {
  const conflicts = {
    'toddler': 'very simple situations like finding a lost toy or helping a friend',
    'preschool': 'gentle challenges like sharing toys or solving simple problems',
    'early-elementary': 'mild conflicts that require creativity and cooperation to resolve',
    'elementary': 'meaningful challenges that promote character growth and moral reasoning',
    'mixed': 'layered conflicts that can be understood at different levels'
  };
  
  return conflicts[ageGroup] || conflicts.mixed;
}

function getThematicElements(ageGroup: string): string {
  const themes = {
    'toddler': 'basic concepts like family love, safety, and comfort',
    'preschool': 'friendship, sharing, and simple emotional understanding',
    'early-elementary': 'cooperation, empathy, and problem-solving skills',
    'elementary': 'personal growth, moral choices, and emotional intelligence',
    'mixed': 'universal themes of love, kindness, and belonging'
  };
  
  return themes[ageGroup] || themes.mixed;
}

function getVocabularyGuidance(ageGroup: string): string {
  const vocabulary = {
    'toddler': 'very simple, repetitive words and short sentences',
    'preschool': 'clear, accessible language with some descriptive words',
    'early-elementary': 'age-appropriate vocabulary with occasional new words in context',
    'elementary': 'rich vocabulary that challenges while remaining comprehensible',
    'mixed': 'layered language that works for multiple reading levels'
  };
  
  return vocabulary[ageGroup] || vocabulary.mixed;
}

function getEndingStyle(ageGroup: string): string {
  const endings = {
    'toddler': 'a very peaceful, sleepy conclusion with familiar comfort',
    'preschool': 'a happy, satisfying ending that reinforces positive feelings',
    'early-elementary': 'a thoughtful conclusion that ties together the story\'s lessons',
    'elementary': 'a meaningful resolution that encourages reflection and growth',
    'mixed': 'a universally satisfying ending that provides closure for all ages'
  };
  
  return endings[ageGroup] || endings.mixed;
}

function getAppropriateSpace(ageGroup: string): string {
  const pacing = {
    'toddler': 'a very slow, gentle pace',
    'preschool': 'a steady, comfortable pace',
    'early-elementary': 'a balanced pace with moments of excitement and calm',
    'elementary': 'dynamic pacing that builds tension and provides resolution',
    'mixed': 'varied pacing that maintains engagement for all ages'
  };
  
  return pacing[ageGroup] || pacing.mixed;
}

// Export for testing purposes
export { generateStoryText, generateAudio, updateStoryStatus, analyzeUploadedImages, generateStoryTitle };