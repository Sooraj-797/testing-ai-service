import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LLM_CONFIG } from './llm.config';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Define the message type for the API
interface LLMMessage {
    role: string;
    content: string;
}

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);

    constructor(private readonly httpService: HttpService) {}

    async generateCompletion(
        messages: LLMMessage[],
        temperature: number = 0.7,
        maxTokens: number = 2000
    ): Promise<string> {
        this.logger.debug(`Generating completion with ${messages.length} messages`);
        
        const requestData = {
            model: LLM_CONFIG.DEFAULT_MODEL,
            messages,
            temperature,
            max_tokens: maxTokens
        };

        // Attempt the API call with retries
        for (let attempt = 1; attempt <= LLM_CONFIG.MAX_RETRIES; attempt++) {
            try {
                const response = await firstValueFrom(
                    this.httpService.post(LLM_CONFIG.API_URL, requestData, {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: LLM_CONFIG.REQUEST_TIMEOUT
                    }).pipe(
                        map(response => response.data),
                        catchError((error: AxiosError) => {
                            this.logger.error(
                                `Error calling LLM API (attempt ${attempt}/${LLM_CONFIG.MAX_RETRIES}): ${error.message}`,
                                error.stack
                            );
                            return throwError(() => error);
                        })
                    )
                );

                return response.choices[0].message.content;
            } catch (error) {
                if (attempt === LLM_CONFIG.MAX_RETRIES) {
                    throw new Error(`Failed to generate completion after ${LLM_CONFIG.MAX_RETRIES} attempts: ${error.message}`);
                }
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, LLM_CONFIG.RETRY_DELAY));
            }
        }
    }

    async runPromptTemplate(promptTemplate: ChatPromptTemplate, inputs: Record<string, any>): Promise<string> {
        try {
            const formattedMessages = await promptTemplate.formatMessages(inputs);
            const llmMessages: LLMMessage[] = formattedMessages.map(msg => ({
                role: msg._getType() === 'human' ? 'user' : 'assistant',
                content: msg.content as string
            }));
            
            const result = await this.generateCompletion(llmMessages);
            return result;
        } catch (error) {
            this.logger.error(`Error running prompt template: ${error.message}`, error.stack);
            throw error;
        }
    }

    async parseJsonResponse<T>(response: string): Promise<T> {
        try {
            // Extract JSON content from the response (in case there's additional text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }
            
            return JSON.parse(jsonMatch[0]) as T;
        } catch (error) {
            this.logger.error(`Error parsing JSON response: ${error.message}`, error.stack);
            throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
        }
    }
} 