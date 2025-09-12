import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for API response
 */
interface ApiResponse {
  response: string;
  context_variables: ContextVariables;
  search_results?: SearchResult[];
  stage?: string;
  end_call?: boolean;
}

/**
 * Interface for context variables
 */
interface ContextVariables {
  session_id: string;
  relevant_contexts: any[];
  scheme: string;
  agent?: string;
  first_agent_response?: FirstAgentResponse;
  scheme_name?: string;
  search_query?: string;
}

/**
 * Interface for first agent response
 */
interface FirstAgentResponse {
  scheme_name: string;
  response: string;
  is_scheme_certain: boolean;
}

/**
 * Interface for search result
 */
interface SearchResult {
  details: string;
  tags: string[];
  schemeName: string;
  schemeShortTitle: string;
  schemeCategory: string[];
  schemeSubCategory: string[];
  eligibilityCriteria: string;
  filename: string;
  slug: string;
}

/**
 * Interface for conversation history item
 */
interface ConversationItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

/**
 * Service to interact with the Golden FAQ Eligibility Chat API
 */
@Injectable()
export class InformationAgentService {
  private readonly logger = new Logger(InformationAgentService.name);
  private readonly baseUrl = process.env.INFORMATION_AGENT_BASE_URL || 'https://modelops1.centralindia.cloudapp.azure.com/api/golden-faq-eligibility-chat/chat';
  private readonly authToken = process.env.INFORMATION_AGENT_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYXJzaGEiLCJleHAiOjE3NzY4NDA4NDN9.nXFhEdzd_LxFzvK7WboyKXb3AlzqM0VNT-xJygXZw1Q';
  private readonly modelName = process.env.INFORMATION_AGENT_MODEL_NAME || 'microsoft/Phi-4';
  private readonly DEFAULT_TIMEOUT = parseInt(process.env.INFORMATION_AGENT_TIMEOUT_MS || '20000', 10);
  private readonly MAX_RETRIES = parseInt(process.env.INFORMATION_AGENT_MAX_RETRIES || '3', 10);
  
  // Track session IDs and conversation history
  private readonly sessionMap: Map<number, string> = new Map();
  private readonly historyMap: Map<string, ConversationItem[]> = new Map();

  /**
   * Starts a new session with the Information Agent
   * @param callSid Unique call session ID
   * @returns The callId needed for subsequent message requests
   * @throws Error if session creation fails
   */
  async startSession(callSid: number): Promise<number> {
    try {
      // Check if we already have a session for this callSid
      if (this.sessionMap.has(callSid)) {
        this.logger.log(`Reusing existing session for callSid: ${callSid}`);
        return callSid; // Return callSid as callId for consistency with original API
      }

      // Generate a new session ID
      const sessionId = uuidv4();
      
      this.logger.log(`Starting new session with ID: ${sessionId} for callSid: ${callSid}`);
      
      // Store the mapping
      this.sessionMap.set(callSid, sessionId);
      this.historyMap.set(sessionId, []);
      
      return callSid; // Return callSid as callId for consistency with original API
    } catch (error) {
      this.handleApiError(error, 'Failed to start Information Agent session');
      throw error;
    }
  }

  /**
   * Ends a session and cleans up memory
   * @param callSid The call session ID to end
   */
  endSession(callSid: number): void {
    const sessionId = this.sessionMap.get(callSid);
    if (sessionId) {
      this.historyMap.delete(sessionId);
      this.sessionMap.delete(callSid);
      this.logger.log(`Ended session for callSid: ${callSid}`);
    }
  }

  /**
   * Sends a message to the Information Agent
   * @param query The user's query to send to the agent
   * @param callId The callId received from session creation API
   * @returns The agent's response message
   * @throws Error if message sending fails
   */
  async sendMessage(query: string, callId: number): Promise<string> {
    let retries = 0;
    
    while (retries < this.MAX_RETRIES) {
      try {
        // Get the session ID for this callId
        const sessionId = this.sessionMap.get(callId);
        if (!sessionId) {
          throw new Error(`No session found for callId: ${callId}`);
        }
        
        // Get conversation history
        const history = this.historyMap.get(sessionId) || [];
        
        this.logger.log(`Sending message to Information Agent for callId: ${callId}, sessionId: ${sessionId} (attempt ${retries + 1}/${this.MAX_RETRIES})`);
        this.logger.debug(`Query: ${query}`);
        
        // Create timestamp for the current message
        const timestamp = new Date().toISOString();
        
        // Prepare the request payload
        const payload = {
          message: query,
          history: history,
          model_name: this.modelName,
          stages: null,
          relevant_contexts: [],
          stage: "identify",
          context_variables: {
            session_id: sessionId,
            relevant_contexts: [],
            scheme: "all"
          },
          search_query: ""
        };
        
        // Make the API request
        const response = await this.makeApiRequest<ApiResponse>(payload);
        
        // Update conversation history
        history.push({
          role: 'user',
          content: query,
          timestamp: timestamp
        });
        
        history.push({
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        });
        
        // Update the history map
        this.historyMap.set(sessionId, history);
        
        return response.data.response;
      } catch (error) {
        retries++;
        
        if (this.shouldRetry(error, retries)) {
          await this.delay(this.calculateBackoff(retries));
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error(`Failed to send message after ${this.MAX_RETRIES} attempts`);
  }
  
  /**
   * Tries to reconnect with a new session if the current one fails
   * @param callSid Original call session ID that failed
   * @returns A new callId or null if reconnection failed
   */
  async reconnect(callSid: number): Promise<number | null> {
    try {
      // Remove the old session
      const oldSessionId = this.sessionMap.get(callSid);
      if (oldSessionId) {
        this.historyMap.delete(oldSessionId);
      }
      this.sessionMap.delete(callSid);
      
      // Create a new session
      this.logger.log(`Attempting to reconnect with same callSid: ${callSid}`);
      
      const callId = await this.startSession(callSid);
      return callId;
    } catch (error) {
      this.logger.error(`Reconnection failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  /**
   * Simple delay utility function
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Makes an API request to the Information Agent API
   * @param data Request data
   * @returns Promise with the API response
   */
  private async makeApiRequest<T>(data: Record<string, any>): Promise<AxiosResponse<T>> {
    return axios({
      method: 'post',
      url: this.baseUrl,
      data,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      timeout: this.DEFAULT_TIMEOUT
    });
  }
  
  /**
   * Handles API errors and logs them appropriately
   * @param error The error to handle
   * @param baseErrorMessage Base error message to use
   * @throws Error with appropriate message
   */
  private handleApiError(error: unknown, baseErrorMessage: string): never {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      this.logger.error(`API error - Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`);
      throw new Error(`${baseErrorMessage}: ${axiosError.message}`);
    } else if (axiosError.request) {
      this.logger.error('API error - No response received from server');
      throw new Error(`${baseErrorMessage}: No response received from server`);
    } else {
      this.logger.error(`API error: ${axiosError.message}`);
      throw new Error(`${baseErrorMessage}: ${axiosError.message}`);
    }
  }
  
  /**
   * Determines if a request should be retried based on the error
   * @param error The error that occurred
   * @param retries Current retry count
   * @returns Whether to retry the request
   */
  private shouldRetry(error: unknown, retries: number): boolean {
    const axiosError = error as AxiosError;
    
    if (retries >= this.MAX_RETRIES) {
      return false;
    }
    
    if (axiosError.response) {
      // Don't retry 500 errors
      if (axiosError.response.status === 500) {
        this.logger.error(`Server error (500) - Data: ${JSON.stringify(axiosError.response.data || {})}`);
        throw new Error(`Server Error: ${JSON.stringify(axiosError.response.data || {})}`);
      }
      
      // Retry other status codes
      return true;
    } else if (axiosError.request) {
      // Network errors are retryable
      this.logger.error(`No response received (attempt ${retries}/${this.MAX_RETRIES})`);
      return true;
    }
    
    // Other errors are not retryable
    this.logger.error(`Request setup error: ${axiosError.message}`);
    throw new Error(`Failed to send message to Information Agent: ${axiosError.message}`);
  }
  
  /**
   * Calculates the backoff time for retries
   * @param retryCount Current retry count
   * @returns Backoff time in ms
   */
  private calculateBackoff(retryCount: number): number {
    // Exponential backoff
    return Math.pow(2, retryCount) * 1000;
  }
} 