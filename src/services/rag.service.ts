import { searchVectors, getCollection } from '@config/vectordb';
import embeddingService from './embedding.service';
import { RAGContext, RAGRetrievalResult } from '../types/evaluation.types';
import { InternalServerError, BadRequestError } from '../utils/errors';

export class RAGService {
  private collectionName = 'documents';

  async retrieveContexts(
    query: string,
    topK: number = 5,
    source?: 'job-description' | 'case-study-brief' | 'scoring-rubric'
  ): Promise<RAGRetrievalResult> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestError('Query cannot be empty');
    }

    const startTime = Date.now();

    try {
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const results = await searchVectors(this.collectionName, queryEmbedding, topK);

      const contexts: RAGContext[] = results
        .filter((result: any) => !source || result.source === source)
        .map((result: any) => ({
          content: result.content,
          source: result.source,
          filename: result.filename,
          similarity_score: result._distance || 0,
          chunk_index: result.chunk_index,
        }));

      return {
        contexts,
        query,
        top_k: topK,
        retrieval_time_ms: Date.now() - startTime,
      };
    } catch (error: any) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new InternalServerError(`Failed to retrieve contexts: ${error.message}`);
    }
  }

  async checkCollectionExists(): Promise<boolean> {
    try {
      await getCollection(this.collectionName);
      return true;
    } catch {
      return false;
    }
  }
}

export default new RAGService();
