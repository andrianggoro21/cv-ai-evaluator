import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export const embedModel = genAI.getGenerativeModel({
  model: 'text-embedding-004',
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embedModel.embedContent(text);
  return result.embedding.values;
}

export async function generateText(
  prompt: string,
  retries: number = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await chatModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API (possible quota limit)');
      }

      return text;
    } catch (error: any) {
      const isQuotaError =
        error.message?.includes('quota') ||
        error.message?.includes('rate limit') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('Empty response');

      if (isQuotaError) {
        console.error(`[Gemini] Quota/Rate limit error (attempt ${i + 1}/${retries})`);
      } else {
        console.error(`[Gemini] API error (attempt ${i + 1}/${retries}):`, error.message);
      }

      if (i === retries - 1) {
        if (isQuotaError) {
          throw new Error('Gemini API quota exceeded. Please try again later or use a different API key.');
        }
        throw error;
      }

      const backoffDelay = Math.pow(2, i) * 1000;
      console.log(`[Gemini] Retrying in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw new Error('Failed to generate text after retries');
}

export default genAI;
