import { generateEmbedding } from '@config/gemini';
import { InternalServerError, BadRequestError } from '../utils/errors';

export class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestError('Text cannot be empty for embedding generation');
    }

    try {
      const embedding = await generateEmbedding(text);
      return embedding;
    } catch (error: any) {
      throw new InternalServerError(`Failed to generate embedding: ${error.message}`);
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      throw new BadRequestError('Text array cannot be empty');
    }

    try {
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error: any) {
      throw new InternalServerError(`Failed to generate embeddings: ${error.message}`);
    }
  }

  chunkText(text: string, maxChunkSize: number = 1000): string[] {
    const sentences = text.split(/[.!?]\s+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

export default new EmbeddingService();
