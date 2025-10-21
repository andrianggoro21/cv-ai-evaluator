import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateText(
  prompt: string,
  retries: number = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2048,
      });

      const text = completion.choices[0]?.message?.content || '';

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Groq API (possible quota limit)');
      }

      return text;
    } catch (error: any) {
      const isQuotaError =
        error.message?.includes('quota') ||
        error.message?.includes('rate limit') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('Empty response');

      if (isQuotaError) {
        console.error(`[Groq] Quota/Rate limit error (attempt ${i + 1}/${retries})`);
      } else {
        console.error(`[Groq] API error (attempt ${i + 1}/${retries}):`, error.message);
      }

      if (i === retries - 1) {
        if (isQuotaError) {
          throw new Error('Groq API quota exceeded. Please try again later or use a different API key.');
        }
        throw error;
      }

      const backoffDelay = Math.pow(2, i) * 1000;
      console.log(`[Groq] Retrying in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw new Error('Failed to generate text after retries');
}

export async function generateEmbedding(_text: string): Promise<number[]> {
  throw new Error('Groq does not support embeddings. Use Gemini for embeddings.');
}

export default groq;
