import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, catchError, firstValueFrom, map, throwError, timer, mergeMap } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { LLM_CONFIG } from './llm.config';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMRequestPayload {
  model: string;
  messages: LLMMessage[];
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: LLMMessage;
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(private readonly httpService: HttpService) {}

  async generateCompletion(
    messages: LLMMessage[],
    model: string = LLM_CONFIG.DEFAULT_MODEL,
    stream: boolean = false,
  ): Promise<LLMResponse> {
    const payload: LLMRequestPayload = {
      model,
      messages,
      stream,
    };

    this.logger.log(`Sending request to LLM API with payload: ${JSON.stringify(payload)}`);
    
    try {
      const response = await firstValueFrom(
        this.httpService.post<LLMResponse>(LLM_CONFIG.API_URL, payload).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Error calling LLM API: ${error.message}`, error.stack);
            return this.handleError(error, payload);
          }),
          map((res: AxiosResponse<LLMResponse>) => res.data),
        ),
      );
      
      return response;
    } catch (error) {
      this.logger.error(`Error in generateCompletion: ${error.message}`, error.stack);
      throw error;
    }
  }

  private handleError(error: AxiosError, payload: LLMRequestPayload, attemptNumber: number = 1) {
    // If we've reached the maximum number of retries, throw the error
    if (attemptNumber > LLM_CONFIG.MAX_RETRIES) {
      return throwError(() => new Error(`Failed to call LLM API after ${LLM_CONFIG.MAX_RETRIES} attempts: ${error.message}`));
    }

    // For certain error types, retry after a delay
    if (error.response?.status === 429 || // Too many requests
        error.response?.status === 503 || // Service unavailable
        error.response?.status === 500) { // Internal server error
      this.logger.warn(`Attempt ${attemptNumber} failed, retrying in ${LLM_CONFIG.RETRY_DELAY}ms...`);
      
      // Exponential backoff with jitter
      const delay = LLM_CONFIG.RETRY_DELAY * Math.pow(2, attemptNumber - 1) * (0.5 + Math.random() * 0.5);
      
      return timer(delay).pipe(
        mergeMap(() => this.httpService.post<LLMResponse>(LLM_CONFIG.API_URL, payload).pipe(
          catchError((retryError: AxiosError) => this.handleError(retryError, payload, attemptNumber + 1)),
          map((res: AxiosResponse<LLMResponse>) => res.data),
        ))
      );
    }

    // For other types of errors, don't retry
    return throwError(() => new Error(`Failed to call LLM API: ${error.message}`));
  }
} 