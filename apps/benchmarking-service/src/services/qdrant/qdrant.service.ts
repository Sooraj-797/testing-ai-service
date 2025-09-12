import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QdrantService {
  private readonly logger = new Logger(QdrantService.name);
  private readonly qdrantUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.qdrantUrl = this.configService.get<string>('QDRANT_URL', 'http://localhost:6333');
  }

  /**
   * Retrieve top-k chunks for a given query
   * @param query The query to search for
   * @param topK Number of chunks to retrieve
   * @param collectionName Qdrant collection name
   * @returns Array of retrieved chunks
   */
  async retrieveChunks(query: string, topK: number = 3, collectionName: string = 'default'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.qdrantUrl}/collections/${collectionName}/points/search`, {
          vector: await this.getQueryEmbedding(query),
          limit: topK,
        })
      );

      if (response.status !== 200) {
        throw new Error(`Qdrant API returned status ${response.status}`);
      }

      return response.data.result.map(item => ({
        id: item.id,
        payload: item.payload,
        score: item.score,
      }));
    } catch (error) {
      this.logger.error(`Failed to retrieve chunks from Qdrant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get embedding for a query
   * This is a placeholder - in a real implementation, you would call your embedding service
   * @param query The query to embed
   * @returns Vector embedding
   */
  private async getQueryEmbedding(query: string): Promise<number[]> {
    // In a real implementation, you would call your embedding service
    // For now, we'll return a placeholder embedding
    // This should be replaced with an actual embedding service call
    try {
      // Placeholder for embedding service call
      // const response = await firstValueFrom(
      //   this.httpService.post('your-embedding-service-url', { text: query })
      // );
      // return response.data.embedding;
      
      // For now, return a dummy embedding of appropriate dimension
      return Array(1536).fill(0).map(() => Math.random() - 0.5);
    } catch (error) {
      this.logger.error(`Failed to get query embedding: ${error.message}`);
      throw error;
    }
  }
} 