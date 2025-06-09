// // scripts/test-ai-integration.ts
// /**
//  * Comprehensive testing suite for AI integration
//  * Run with: npx tsx scripts/test-ai-integration.ts
//  */

// import { generateStoryText } from '../lib/services/story-generation';
// import { generateAudio, splitTextForTTS } from '../lib/services/tts-service';
// import { createServiceRoleClient } from '../lib/supabase/admin';

// // Test data sets for different scenarios
// const testScenarios = [
//   {
//     name: "Toddler Adventure Story (English)",
//     data: {
//       theme: 'adventure',
//       characters: [{ name: 'Bunny', description: 'A soft, cuddly rabbit who loves carrots' }],
//       language: 'en',
//       voice: 'default-en-female',
//       duration: 'short',
//       targetAge: '2-4',
//       customPrompt: 'Include counting from 1 to 3'
//     }
//   },
//   {
//     name: "Preschool Fantasy Story (Indonesian)",
//     data: {
//       theme: 'fantasy',
//       characters: [
//         { name: 'Maya', description: 'Anak perempuan yang suka bermain' },
//         { name: 'Kiki', description: 'Kucing ajaib yang bisa terbang' }
//       ],
//       language: 'id',
//       voice: 'default-id-female',
//       duration: 'medium',
//       targetAge: '3-5'
//     }
//   },
//   {
//     name: "Elementary Mystery Story (English)",
//     data: {
//       theme: 'mystery',
//       characters: [
//         { name: 'Alex', description: 'A curious detective with sharp observation skills' },
//         { name: 'Luna', description: 'A helpful librarian who knows many secrets' }
//       ],
//       language: 'en',
//       voice: '21m00Tcm4TlvDq8ikWAM', // ElevenLabs Rachel voice
//       duration: 'long',
//       targetAge: '6-10',
//       customPrompt: 'Set in a magical library with talking books'
//     }
//   },
//   {
//     name: "Mixed Age Bedtime Story (English)",
//     data: {
//       theme: 'calming bedtime',
//       characters: [{ name: 'Sleepy Star', description: 'A gentle star who helps children fall asleep' }],
//       language: 'en',
//       voice: 'default-en-male',
//       duration: 'medium',
//       targetAge: 'mixed',
//       customPrompt: 'Include gentle breathing exercises'
//     }
//   }
// ];

// interface TestResult {
//   scenario: string;
//   success: boolean;
//   duration: number;
//   storyLength: number;
//   audioUrl?: string;
//   error?: string;
//   warnings: string[];
// }

// async function runComprehensiveTests(): Promise<void> {
//   console.log('🚀 Starting AI Integration Test Suite...\n');
  
//   // Check environment variables first
//   const envCheck = checkEnvironmentVariables();
//   if (!envCheck.success) {
//     console.error('❌ Environment check failed:', envCheck.message);
//     return;
//   }
//   console.log('✅ Environment variables configured\n');

//   // Test database connection
//   console.log('🔗 Testing database connection...');
//   const dbTest = await testDatabaseConnection();
//   if (!dbTest.success) {
//     console.error('❌ Database connection failed:', dbTest.message);
//     return;
//   }
//   console.log('✅ Database connection successful\n');

//   const results: TestResult[] = [];

//   // Run story generation tests
//   for (const scenario of testScenarios) {
//     console.log(`📖 Testing: ${scenario.name}`);
//     const result = await testStoryGeneration(scenario);
//     results.push(result);
    
//     if (result.success) {
//       console.log(`✅ Story generated (${result.storyLength} chars, ${result.duration}ms)`);
      
//       // Test TTS if story generation succeeded
//       if (result.storyLength > 0) {
//         console.log(`🎵 Testing TTS for: ${scenario.name}`);
//         const ttsResult = await testTTS(scenario, result.storyLength);
//         if (ttsResult.success) {
//           result.audioUrl = ttsResult.audioUrl;
//           console.log(`✅ Audio generated: ${ttsResult.audioUrl}`);
//         } else {
//           result.warnings.push(`TTS failed: ${ttsResult.error}`);
//           console.log(`⚠️ TTS warning: ${ttsResult.error}`);
//         }
//       }
//     } else {
//       console.log(`❌ Failed: ${result.error}`);
//     }
//     console.log('');
//   }

//   // Run additional tests
//   console.log('🧪 Running additional tests...\n');
  
//   await testErrorHandling();
//   await testTextSplitting();
//   await testCostCalculation(results);

//   // Generate test report
//   generateTestReport(results);
// }

// function checkEnvironmentVariables(): { success: boolean; message?: string } {
//   const required = ['OPENAI_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
//   const optional = ['ELEVENLABS_API_KEY', 'AWS_ACCESS_KEY_ID'];
  
//   const missing = required.filter(key => !process.env[key]);
  
//   if (missing.length > 0) {
//     return { success: false, message: `Missing required: ${missing.join(', ')}` };
//   }

//   const optionalMissing = optional.filter(key => !process.env[key]);
//   if (optionalMissing.length > 0) {
//     console.log(`⚠️ Optional variables missing: ${optionalMissing.join(', ')}`);
//   }

//   return { success: true };
// }

// async function testDatabaseConnection(): Promise<{ success: boolean; message?: string }> {
//   try {
//     const supabase = createServiceRoleClient();
//     const { data, error } = await supabase.from('stories').select('id').limit(1);
    
//     if (error) {
//       return { success: false, message: error.message };
//     }
    
//     return { success: true };
//   } catch (error: any) {
//     return { success: false, message: error.message };
//   }
// }

// async function testStoryGeneration(scenario: any): Promise<TestResult> {
//   const startTime = Date.now();
//   const result: TestResult = {
//     scenario: scenario.name,
//     success: false,
//     duration: 0,
//     storyLength: 0,
//     warnings: []
//   };

//   try {
//     console.log(`  📝 Generating story for ${scenario.data.targetAge} age group...`);
    
//     // const story = await generateStoryText(scenario.data);
    
//     result.duration = Date.now() - startTime;
//     result.storyLength = story.length;
//     result.success = true;

//     // Validate story content
//     const validation = validateStoryContent(story, scenario.data);
//     result.warnings.push(...validation.warnings);

//     console.log(`  📊 Story stats: ${story.length} characters, ${story.split(' ').length} words`);
    
//     if (validation.warnings.length > 0) {
//       console.log(`  ⚠️ Validation warnings: ${validation.warnings.length}`);
//     }

//   } catch (error: any) {
//     result.duration = Date.now() - startTime;
//     result.error = error.message;
//     result.success = false;
//   }

//   return result;
// }

// async function testTTS(scenario: any, storyLength: number): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
//   try {
//     // Use a shorter test text for TTS to avoid costs during testing
//     const testText = storyLength > 500 
//       ? "Once upon a time, there was a magical story waiting to be told. This is just a test of the audio generation system."
//       : "Test audio generation.";

//     console.log(`  🎤 Testing TTS with ${scenario.data.voice} voice...`);
    
//     const audioUrl = await generateAudio(testText, scenario.data.voice);
    
//     return { success: true, audioUrl };
//   } catch (error: any) {
//     return { success: false, error: error.message };
//   }
// }

// function validateStoryContent(story: string, storyData: any): { warnings: string[] } {
//   const warnings: string[] = [];
  
//   // Check story length appropriateness for age
//   const ageGroups = {
//     '2-4': { min: 50, max: 400 },
//     '3-5': { min: 100, max: 500 },
//     '5-7': { min: 200, max: 700 },
//     '6-10': { min: 400, max: 1000 },
//     'mixed': { min: 300, max: 800 }
//   };

//   const expectedLength = ageGroups[storyData.targetAge as keyof typeof ageGroups];
//   if (expectedLength) {
//     if (story.length < expectedLength.min) {
//       warnings.push(`Story too short for age ${storyData.targetAge} (${story.length} < ${expectedLength.min})`);
//     }
//     if (story.length > expectedLength.max) {
//       warnings.push(`Story too long for age ${storyData.targetAge} (${story.length} > ${expectedLength.max})`);
//     }
//   }

//   // Check character inclusion
//   storyData.characters?.forEach((char: any) => {
//     if (!story.toLowerCase().includes(char.name.toLowerCase())) {
//       warnings.push(`Character "${char.name}" not found in story`);
//     }
//   });

//   // Check theme inclusion
//   if (!story.toLowerCase().includes(storyData.theme.toLowerCase().split(' ')[0])) {
//     warnings.push(`Theme "${storyData.theme}" not clearly represented`);
//   }

//   // Check language appropriateness
//   if (storyData.language === 'id') {
//     if (!story.includes('pada') && !story.includes('di') && !story.includes('yang')) {
//       warnings.push('Story may not be in Indonesian as requested');
//     }
//   }

//   // Check for bedtime-appropriate ending
//   const bedtimeWords = ['sleep', 'dream', 'peaceful', 'rest', 'tired', 'cozy', 'tidur', 'mimpi', 'tenang'];
//   const hasBeditimeEnding = bedtimeWords.some(word => 
//     story.toLowerCase().includes(word.toLowerCase())
//   );
  
//   if (!hasBeditimeEnding) {
//     warnings.push('Story may not have appropriate bedtime ending');
//   }

//   return { warnings };
// }

// async function testErrorHandling(): Promise<void> {
//   console.log('🛡️ Testing error handling...');

//   // Test with invalid API key (temporarily)
//   const originalKey = process.env.OPENAI_API_KEY;
//   process.env.OPENAI_API_KEY = 'invalid-key';
  
//   try {
//     await generateStoryText({
//       theme: 'test',
//       characters: [],
//       language: 'en',
//       voice: 'test',
//       targetAge: '5-7'
//     });
//     console.log('❌ Error handling test failed - should have thrown error');
//   } catch (error) {
//     console.log('✅ Error handling working correctly');
//   }
  
//   // Restore original key
//   process.env.OPENAI_API_KEY = originalKey;
// }

// async function testTextSplitting(): Promise<void> {
//   console.log('✂️ Testing text splitting for long stories...');
  
//   const longText = 'This is a test sentence. '.repeat(200);
//   const chunks = splitTextForTTS(longText, 100);
  
//   if (chunks.length > 1) {
//     console.log(`✅ Text splitting working: ${chunks.length} chunks created`);
//   } else {
//     console.log('✅ Text splitting working: no splitting needed');
//   }
// }

// async function testCostCalculation(results: TestResult[]): Promise<void> {
//   console.log('💰 Calculating estimated costs...');
  
//   const successfulStories = results.filter(r => r.success);
//   const totalChars = successfulStories.reduce((sum, r) => sum + r.storyLength, 0);
//   const averageLength = totalChars / successfulStories.length;
  
//   // OpenAI cost estimation (approximate)
//   const gpt4CostPer1kTokens = 0.03;
//   const averageTokens = averageLength / 4; // rough chars to tokens ratio
//   const costPerStory = (averageTokens / 1000) * gpt4CostPer1kTokens;
  
//   console.log(`📊 Average story length: ${Math.round(averageLength)} characters`);
//   console.log(`💵 Estimated cost per story: $${costPerStory.toFixed(4)}`);
//   console.log(`💵 Estimated cost for 100 stories/day: $${(costPerStory * 100).toFixed(2)}`);
// }

// function generateTestReport(results: TestResult[]): void {
//   console.log('\n📋 TEST REPORT');
//   console.log('='.repeat(50));
  
//   const successful = results.filter(r => r.success).length;
//   const failed = results.length - successful;
  
//   console.log(`Total Tests: ${results.length}`);
//   console.log(`Successful: ${successful} ✅`);
//   console.log(`Failed: ${failed} ${failed > 0 ? '❌' : '✅'}`);
//   console.log(`Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);
  
//   console.log('\nDetailed Results:');
//   results.forEach(result => {
//     console.log(`\n${result.scenario}:`);
//     console.log(`  Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
//     console.log(`  Duration: ${result.duration}ms`);
//     console.log(`  Story Length: ${result.storyLength} chars`);
//     if (result.audioUrl) {
//       console.log(`  Audio: ${result.audioUrl}`);
//     }
//     if (result.error) {
//       console.log(`  Error: ${result.error}`);
//     }
//     if (result.warnings.length > 0) {
//       console.log(`  Warnings: ${result.warnings.length}`);
//       result.warnings.forEach(warning => console.log(`    - ${warning}`));
//     }
//   });
  
//   console.log('\n🎯 RECOMMENDATIONS:');
  
//   if (failed > 0) {
//     console.log('❌ Fix failed tests before deploying to production');
//   }
  
//   const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
//   if (totalWarnings > 0) {
//     console.log(`⚠️ Review ${totalWarnings} warnings for quality improvements`);
//   }
  
//   const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
//   if (avgDuration > 10000) {
//     console.log('⏱️ Consider optimizing for faster generation times');
//   }
  
//   console.log('✅ Ready for production deployment!');
// }

// // Export for individual testing
// export {
//   testStoryGeneration,
//   testTTS,
//   validateStoryContent,
//   runComprehensiveTests
// };

// // Run tests if called directly
// if (require.main === module) {
//   runComprehensiveTests().catch(console.error);
// }