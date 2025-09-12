import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Store chunks in cache with TTL
   * @param key Cache key (usually testCaseId)
   * @param chunks Chunks to store
   * @param ttl Time to live in seconds (default 1 hour)
   */
  async storeChunks(key: string, chunks: any[], ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(
        `chunks:${key}`,
        ttl,
        JSON.stringify(chunks)
      );
      this.logger.log(`Stored chunks for key ${key} with TTL ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to store chunks in cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve chunks from cache
   * @param key Cache key (usually testCaseId)
   * @returns Chunks if found, null otherwise
   */
  async getChunks(key: string): Promise<any[] | null> {
    try {
      const cachedChunks = await this.redis.get(`chunks:${key}`);
      if (!cachedChunks) {
        return null;
      }
      return JSON.parse(cachedChunks);
    } catch (error) {
      this.logger.error(`Failed to get chunks from cache: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete chunks from cache
   * @param key Cache key (usually testCaseId)
   */
  async deleteChunks(key: string): Promise<void> {
    try {
      await this.redis.del(`chunks:${key}`);
      this.logger.log(`Deleted chunks for key ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete chunks from cache: ${error.message}`);
      throw error;
    }
  }
} 