import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  private readonly anthropic: Anthropic;
  private readonly inHouseModelUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Initialize Anthropic client for baseline model (Claude)
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY', 'dummy-key'),
    });

    // In-house model API endpoint
    this.inHouseModelUrl = this.configService.get<string>('IN_HOUSE_MODEL_URL', 'http://localhost:8000/v1/chat/completions');
  }

  /**
   * Get response from the in-house model
   * @param prompt The prompt to send to the model
   * @param retrievedChunks Optional context chunks to include
   * @returns Model response
   */
  async getInHouseModelResponse(prompt: string, retrievedChunks?: any[]): Promise<string> {
    try {
      // Prepare the context with retrieved chunks if available
      let contextPrompt = prompt;
      if (retrievedChunks && retrievedChunks.length > 0) {
        const contextText = retrievedChunks
          .map(chunk => `Content: ${chunk.payload?.content || 'No content'}\nSource: ${chunk.payload?.source || 'Unknown'}\n`)
          .join('\n');
        
        contextPrompt = `Here is some relevant context information:\n\n${contextText}\n\nBased on the above context, please respond to the following:\n\n${prompt}`;
      }

      // Call in-house model API
      const response = await firstValueFrom(
        this.httpService.post(this.inHouseModelUrl, {
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: contextPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.configService.get<string>('IN_HOUSE_MODEL_API_KEY', 'dummy-key')}`
          }
        })
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Failed to get in-house model response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get response from the baseline model (Claude)
   * @param prompt The prompt to send to the model
   * @returns Model response
   */
  async getBaselineModelResponse(prompt: string): Promise<string> {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: 'You are a helpful AI assistant.'
      });

      // Handle the content based on its type
      if (message.content[0].type === 'text') {
        return message.content[0].text;
      }
      
      return 'The model did not return a text response';
    } catch (error) {
      this.logger.error(`Failed to get baseline model response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Evaluate the in-house model response against the baseline
   * @param inHouseResponse The in-house model response
   * @param baselineResponse The baseline model response
   * @returns Score between 0-1 and evaluation notes
   */
  async evaluateResponses(inHouseResponse: string, baselineResponse: string): Promise<{ score: number, notes: string }> {
    try {
      // Use Claude to evaluate the responses
      const evaluationPrompt = `
        You are an expert AI evaluator. Your task is to compare two AI responses to the same prompt:

        BASELINE MODEL RESPONSE:
        ${baselineResponse}

        IN-HOUSE MODEL RESPONSE:
        ${inHouseResponse}

        Please evaluate the in-house model response compared to the baseline model on a scale from 0 to 1, where:
        - 0 means the in-house model response is significantly worse than the baseline
        - 0.5 means the responses are of equal quality
        - 1 means the in-house model response is significantly better than the baseline

        Consider factors such as:
        - Accuracy of information
        - Relevance to the prompt
        - Clarity and coherence
        - Depth and completeness
        - Logical reasoning

        First provide a detailed analysis, then provide your final score as a decimal between 0 and 1.
        Format your response as:
        ANALYSIS: [your detailed analysis]
        SCORE: [decimal between 0 and 1]
      `;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1500,
        messages: [
          { role: 'user', content: evaluationPrompt }
        ],
        system: 'You are an expert AI evaluator tasked with comparing AI responses.'
      });

      // Handle the content based on its type
      let evaluationText = '';
      if (message.content[0].type === 'text') {
        evaluationText = message.content[0].text;
      } else {
        return { score: 0.5, notes: 'The evaluation model did not return a text response' };
      }
      
      // Extract score from the response
      const scoreMatch = evaluationText.match(/SCORE:\s*(0\.\d+|[01])/i);
      const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0.5;
      
      // Extract analysis
      const analysisMatch = evaluationText.match(/ANALYSIS:\s*([\s\S]+?)(?=SCORE:|$)/i);
      const notes = analysisMatch ? analysisMatch[1].trim() : 'No analysis provided';

      return { score, notes };
    } catch (error) {
      this.logger.error(`Failed to evaluate responses: ${error.message}`);
      // Default to neutral score if evaluation fails
      return { score: 0.5, notes: `Evaluation failed: ${error.message}` };
    }
  }
} 