import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
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
      return response.text();
    } catch (error: any) {
      console.error(`Gemini API error (attempt ${i + 1}/${retries}):`, error.message);

      if (i === retries - 1) throw error;

      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Failed to generate text after retries');
}

export default genAI;
