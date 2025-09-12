import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { EVALUATION_SYSTEM_PROMPTS, EVALUATION_MESSAGE_PAIR_PROMPT, EVALUATION_FULL_CONVERSATION_PROMPT } from '../constants/llm.constants';

/**
 * Interface for conversation message
 */
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interface for evaluation request
 */
interface EvaluationRequest {
  sessionID: number;
  personaID: string;
  agent: string;
  conversation: ConversationMessage[];
  scenario: string;
}

/**
 * Interface for evaluation metrics
 */
interface EvaluationMetrics {
  intentUnderstanding: { score: number; justification: string };
  relevance: { score: number; justification: string };
  completeness: { score: number; justification: string };
  clarity: { score: number; justification: string };
  proactivity: { score: number; justification: string };
  helpfulness: { score: number; justification: string };
}

/**
 * Interface for message pair evaluation
 */
interface MessagePairEvaluation {
  userMessage: string;
  assistantMessage: string;
  metrics: EvaluationMetrics;
}

/**
 * Interface for full conversation evaluation
 */
interface FullConversationEvaluation {
  metrics: EvaluationMetrics;
  overallAssessment: string;
  messagePairEvaluations: MessagePairEvaluation[];
}

/**
 * Interface for evaluation response
 */
interface EvaluationResponse {
  sessionID: number;
  personaID: string;
  agent: string;
  conversationEvaluation: FullConversationEvaluation;
}

/**
 * Service to evaluate conversations between users and various agents
 */
@Injectable()
export class EvaluationAgent {
  private readonly logger = new Logger(EvaluationAgent.name);
  private readonly MODEL_URL = 'https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview';
  private readonly API_KEY = 'C4nHEVwGLsfv20S6NSN7WWAJwK5MLkuWBlcvn2OcJb68IfS0uCESJQQJ99BCACHYHv6XJ3w3AAAAACOGolyT';

  private getSystemPromptForAgent(agent: string): string {
    switch (agent.toLowerCase()) {
      case 'information agent':
        return EVALUATION_SYSTEM_PROMPTS.INFORMATION_AGENT;
      default:
        return EVALUATION_SYSTEM_PROMPTS.DEFAULT(agent);
    }
  }

  constructor() {}

  /**
   * Evaluate a conversation request
   */
  async evaluateConversation(request: EvaluationRequest): Promise<EvaluationResponse> {
    this.logger.log(`Evaluating conversation for session ${request.sessionID}`);

    try {
      // Get message pairs from conversation
      const messagePairs = this.getMessagePairs(request.conversation);
      
      // Evaluate each message pair
      const messagePairEvaluations = await Promise.all(
        messagePairs.map(pair => this.evaluateMessagePair(pair, request))
      );

      // Evaluate full conversation
      const fullConversationEvaluation = await this.evaluateFullConversation(
        request,
        messagePairEvaluations
      );

      return {
        sessionID: request.sessionID,
        personaID: request.personaID,
        agent: request.agent,
        conversationEvaluation: fullConversationEvaluation
      };
    } catch (error) {
      this.logger.error(`Error evaluating conversation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract message pairs from conversation
   */
  private getMessagePairs(conversation: ConversationMessage[]): Array<[ConversationMessage, ConversationMessage]> {
    const pairs: Array<[ConversationMessage, ConversationMessage]> = [];
    
    for (let i = 0; i < conversation.length - 1; i += 2) {
      if (conversation[i].role === 'user' && conversation[i + 1]?.role === 'assistant') {
        pairs.push([conversation[i], conversation[i + 1]]);
      }
    }
    
    return pairs;
  }

  /**
   * Evaluate a single message pair
   */
  private async evaluateMessagePair(
    pair: [ConversationMessage, ConversationMessage],
    request: EvaluationRequest
  ): Promise<MessagePairEvaluation> {
    const [userMessage, assistantMessage] = pair;

    const prompt = EVALUATION_MESSAGE_PAIR_PROMPT
      .replace('{agent}', request.agent)
      .replace('{scenario}', request.scenario)
      .replace('{userMessage}', userMessage.content)
      .replace('{assistantMessage}', assistantMessage.content);

    const result = await this.callLLM(prompt, request.agent);
    const { metrics } = this.parseEvaluationResult(result);

    return {
      userMessage: userMessage.content,
      assistantMessage: assistantMessage.content,
      metrics
    };
  }

  /**
   * Evaluate the full conversation
   */
  private async evaluateFullConversation(
    request: EvaluationRequest,
    messagePairEvaluations: MessagePairEvaluation[]
  ): Promise<FullConversationEvaluation> {
    const formattedConversation = request.conversation
      .map((msg, idx) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const prompt = EVALUATION_FULL_CONVERSATION_PROMPT
      .replace('{agent}', request.agent)
      .replace('{scenario}', request.scenario)
      .replace('{conversation}', formattedConversation);

    const result = await this.callLLM(prompt, request.agent);
    const { metrics, overallAssessment } = this.parseEvaluationResult(result, true);

    return {
      metrics,
      overallAssessment,
      messagePairEvaluations
    };
  }

  /**
   * Call the LLM API
   */
  private async callLLM(prompt: string, agent: string): Promise<string> {
    try {
      const response = await axios.post(this.MODEL_URL, {
        messages: [
          {
            role: 'system',
            content: this.getSystemPromptForAgent(agent),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      this.handleLlmError(error);
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  /**
   * Parse the evaluation result from the LLM
   */
  private parseEvaluationResult(evaluationText: string, isFullConversation: boolean = false): { metrics: EvaluationMetrics; overallAssessment?: string } {
    try {
      const metrics: EvaluationMetrics = {
        intentUnderstanding: this.extractMetric(evaluationText, 'INTENT_UNDERSTANDING'),
        relevance: this.extractMetric(evaluationText, 'RELEVANCE'),
        completeness: this.extractMetric(evaluationText, 'COMPLETENESS'),
        clarity: this.extractMetric(evaluationText, 'CLARITY'),
        proactivity: this.extractMetric(evaluationText, 'PROACTIVITY'),
        helpfulness: this.extractMetric(evaluationText, 'HELPFULNESS')
      };

      if (isFullConversation) {
        const overallMatch = evaluationText.match(/OVERALL_ASSESSMENT:\s*([\s\S]+?)(?=\n|$)/i);
        const overallAssessment = overallMatch ? overallMatch[1].trim() : 'No overall assessment provided.';
        return { metrics, overallAssessment };
      }

      return { metrics };
    } catch (error) {
      this.logger.error(`Error parsing evaluation result: ${error.message}`);
      return {
        metrics: this.getDefaultMetrics(),
        ...(isFullConversation && { overallAssessment: `Error parsing evaluation: ${error.message}` })
      };
    }
  }

  /**
   * Extract a single metric from evaluation text
   */
  private extractMetric(evaluationText: string, metricName: string): { score: number; justification: string } {
    const scoreMatch = evaluationText.match(new RegExp(`${metricName}_SCORE:\\s*(\\d+)`, 'i'));
    const justificationMatch = evaluationText.match(new RegExp(`${metricName}_JUSTIFICATION:\\s*([\\s\\S]+?)(?=\\n\\w+_SCORE:|$)`, 'i'));
    
    const score = scoreMatch ? Math.min(10, Math.max(0, parseInt(scoreMatch[1], 10))) : 5;
    const justification = justificationMatch ? justificationMatch[1].trim() : 'No justification provided.';
    
    return { score, justification };
  }

  /**
   * Get default metrics for error cases
   */
  private getDefaultMetrics(): EvaluationMetrics {
    return {
      intentUnderstanding: { score: 5, justification: 'Error parsing metric.' },
      relevance: { score: 5, justification: 'Error parsing metric.' },
      completeness: { score: 5, justification: 'Error parsing metric.' },
      clarity: { score: 5, justification: 'Error parsing metric.' },
      proactivity: { score: 5, justification: 'Error parsing metric.' },
      helpfulness: { score: 5, justification: 'Error parsing metric.' }
    };
  }

  /**
   * Handle LLM API errors
   */
  private handleLlmError(error: unknown): void {
    const axiosError = error as AxiosError;
    let errorMessage = 'Unknown LLM error';
    
    if (axiosError.response) {
      errorMessage = `LLM API error: Status ${axiosError.response.status}`;
      if (axiosError.response.data) {
        errorMessage += `, Message: ${JSON.stringify(axiosError.response.data)}`;
      }
    } else if (axiosError.request) {
      errorMessage = 'LLM API request failed: No response received';
    } else {
      errorMessage = `LLM API call setup error: ${axiosError.message}`;
    }
    
    this.logger.error(errorMessage);
  }
}
