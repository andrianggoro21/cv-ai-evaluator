import * as gemini from './gemini';
import * as groq from './groq';

type LLMProvider = 'gemini' | 'groq';

const provider: LLMProvider = (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

console.log(`[LLM] Using provider: ${provider}`);

export async function generateText(prompt: string, retries: number = 3): Promise<string> {
  switch (provider) {
    case 'groq':
      return groq.generateText(prompt, retries);
    case 'gemini':
      return gemini.generateText(prompt, retries);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return gemini.generateEmbedding(text);
}

export { provider };
