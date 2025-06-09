// lib/config/ai-config.ts
import OpenAI from 'openai';

export interface AIConfig {
  service: 'deepseek' | 'openai';
  client: OpenAI;
  model: string;
  maxTokens: {
    short: number;
    medium: number;
    long: number;
  };
  costPerToken: number; // Approximate cost per 1K tokens in USD
}

// Initialize AI clients
const deepseekClient = process.env.DEEPSEEK_API_KEY ? new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
}) : null;

const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Vision client (always OpenAI for now since DeepSeek doesn't have vision)
const visionClient = openaiClient;

// AI Service configurations
const AI_SERVICES = {
  deepseek: {
    service: 'deepseek' as const,
    client: deepseekClient!,
    model: 'deepseek-chat',
    maxTokens: {
      short: 800,
      medium: 1500,
      long: 2500
    },
    costPerToken: 0.00014, // $0.14 per 1M tokens (much cheaper than OpenAI)
    available: !!deepseekClient
  },
  openai: {
    service: 'openai' as const,
    client: openaiClient!,
    model: 'gpt-4o-mini', // Fast and relatively cheap
    maxTokens: {
      short: 800,
      medium: 1500,
      long: 2500
    },
    costPerToken: 0.00015, // $0.15 per 1M input tokens
    available: !!openaiClient
  }
};

// Get preferred AI service based on environment and availability
export function getAIService(): AIConfig {
  const preferredService = (process.env.AI_SERVICE as keyof typeof AI_SERVICES) || 'deepseek';
  
  console.log(`[AI Config] Preferred service: ${preferredService}`);
  
  // Try preferred service first
  if (AI_SERVICES[preferredService]?.available) {
    console.log(`[AI Config] Using ${preferredService} - Cost: $${AI_SERVICES[preferredService].costPerToken * 1000}/1K tokens`);
    return AI_SERVICES[preferredService];
  }
  
  // Fallback to any available service
  const fallbackService = Object.values(AI_SERVICES).find(service => service.available);
  
  if (!fallbackService) {
    throw new Error('No AI service available. Please configure DEEPSEEK_API_KEY or OPENAI_API_KEY');
  }
  
  console.log(`[AI Config] Falling back to ${fallbackService.service}`);
  return fallbackService;
}

// Get vision service (currently always OpenAI)
export function getVisionService(): { client: OpenAI; model: string } {
  if (!visionClient) {
    throw new Error('Vision service requires OPENAI_API_KEY (DeepSeek vision not available yet)');
  }
  
  return {
    client: visionClient,
    model: 'gpt-4o' // OpenAI's vision model
  };
}

// Estimate cost for a story generation
export function estimateStoryCost(wordCount: number, service?: 'deepseek' | 'openai'): {
  estimatedCost: number;
  service: string;
  explanation: string;
} {
  const aiService = service ? AI_SERVICES[service] : getAIService();
  
  // Rough estimation: 1 word ≈ 1.3 tokens
  const estimatedTokens = Math.ceil(wordCount * 1.3);
  const cost = (estimatedTokens / 1000) * aiService.costPerToken;
  
  return {
    estimatedCost: cost,
    service: aiService.service,
    explanation: `~${estimatedTokens} tokens × $${aiService.costPerToken}/1K = $${cost.toFixed(4)}`
  };
}

// Health check for AI services
export async function checkAIServiceHealth(): Promise<{
  deepseek: { available: boolean; error?: string };
  openai: { available: boolean; error?: string };
  vision: { available: boolean; error?: string };
}> {
  const results = {
    deepseek: { available: false, error: undefined as string | undefined },
    openai: { available: false, error: undefined as string | undefined },
    vision: { available: false, error: undefined as string | undefined }
  };

  // Test DeepSeek
  if (deepseekClient) {
    try {
      await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        // timeout: 5000
      });
      results.deepseek.available = true;
    } catch (error: any) {
      results.deepseek.error = error.message;
    }
  } else {
    results.deepseek.error = 'API key not configured';
  }

  // Test OpenAI
  if (openaiClient) {
    try {
      await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        // timeout: 5000
      });
      results.openai.available = true;
      results.vision.available = true; // Vision uses same client
    } catch (error: any) {
      results.openai.error = error.message;
      results.vision.error = error.message;
    }
  } else {
    results.openai.error = 'API key not configured';
    results.vision.error = 'API key not configured';
  }

  return results;
}

// Cost comparison
export function compareCosts(wordCount: number = 500): {
  deepseek: number;
  openai: number;
  savings: number;
  savingsPercentage: number;
} {
  const deepseekCost = estimateStoryCost(wordCount, 'deepseek').estimatedCost;
  const openaiCost = estimateStoryCost(wordCount, 'openai').estimatedCost;
  const savings = openaiCost - deepseekCost;
  const savingsPercentage = ((savings / openaiCost) * 100);

  return {
    deepseek: deepseekCost,
    openai: openaiCost,
    savings,
    savingsPercentage
  };
}

// Log service selection
export function logServiceSelection(): void {
  try {
    const service = getAIService();
    const costs = compareCosts();
    
    console.log(`
🤖 AI Service Configuration:
├── Service: ${service.service.toUpperCase()}
├── Model: ${service.model}
├── Cost: $${service.costPerToken * 1000}/1K tokens
└── ${service.service === 'deepseek' ? `💰 Saves ${costs.savingsPercentage.toFixed(1)}% vs OpenAI` : '💡 Consider switching to DeepSeek for cost savings'}
    `);
  } catch (error) {
    console.error('❌ AI Service Configuration Error:', error);
  }
}