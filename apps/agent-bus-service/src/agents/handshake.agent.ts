import { Injectable, Logger } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage, HumanMessage } from '@langchain/core/messages';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { ChatGeneration, ChatResult } from '@langchain/core/outputs';
import axios, { AxiosError } from 'axios';
import { CreateHandshakeDto } from '../domain/handshake/dto/create-handshake.dto';
import { HANDSHAKE_INITIAL_PROMPT_TEMPLATE, HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE } from '../constants/llm.constants';
import { InformationAgentService } from './services/information-agent.service';

/**
 * Interface for persona location
 */
interface PersonaLocation {
  areaType?: string;
  district?: string;
  tehsil?: string;
  ward?: string;
}

/**
 * Interface for persona information - this is just a type guide, 
 * all fields from the payload will be used dynamically
 */
interface Persona {
  name?: string;
  age?: string | number;
  location?: PersonaLocation;
  emotions?: string[];
  // Allow any additional fields from the payload
  [key: string]: any;
}

/**
 * Interface for conversation message
 */
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interface for conversation result
 */
interface ConversationResult {
  id: number;
  emotions?: string[];
  conversation: ConversationMessage[];
  error?: string;
  [key: string]: any; // Allow additional dynamic fields
}

/**
 * Interface for handshake response
 */
interface HandshakeResponse {
  sessionID: string | number;
  agentToSpeak: string;
  personas: ConversationResult[];
}

/**
 * Custom LLM implementation to handle persona-based responses
 */
class CustomLLM extends BaseChatModel {
  private persona: Persona | any;
  private readonly logger = new Logger(CustomLLM.name);
  private readonly MODEL_URL = process.env.HANDSHAKE_LLM_URL || 'https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview';
  private readonly API_KEY = process.env.HANDSHAKE_LLM_API_KEY || 'C4nHEVwGLsfv20S6NSN7WWAJwK5MLkuWBlcvn2OcJb68IfS0uCESJQQJ99BCACHYHv6XJ3w3AAAAACOGolyT';
  private readonly SYSTEM_PROMPT = 'You are responding as an Indian person with dynamic characteristics that will be provided to you. Your persona may include various fields like name, age, location, emotions, occupation, education, family details, and others - these will vary. Respond naturally based on ALL the characteristics given to you. Speak STRICTLY in ENGLISH ONLY. DO NOT use Hindi or any regional language words or phrases, not even for greetings or common expressions. Use only English words and phrases in your response. Avoid transliterations of Hindi or regional language words.';
  private readonly FALLBACK_RESPONSE = 'I need information about government schemes. Could you please help me?';

  constructor(persona: Persona | any) {
    super({});
    // Ensure persona is an object to prevent errors in formatting
    this.persona = persona && typeof persona === 'object' ? persona : {};
    this.logger.log(`Initialized CustomLLM with persona: ${JSON.stringify(this.persona)}`);
  }

  async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    let messageContent = messages[messages.length - 1].content as string;
    
    // Add additional instruction for English-only responses
    messageContent = this.addEnglishOnlyInstruction(messageContent);
    
    try {
      const response = await axios.post(this.MODEL_URL, {
        messages: [
          {
            role: 'system',
            content: this.SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        temperature: 0.7,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.API_KEY,
        },
      });

      const content = response.data.choices[0].message.content;
      
      return {
        generations: [{
          text: content,
          message: new AIMessage(content),
        }],
      };
    } catch (error) {
      this.handleLlmError(error);
      
      // Fallback response if LLM fails
      return {
        generations: [{
          text: this.FALLBACK_RESPONSE,
          message: new AIMessage(this.FALLBACK_RESPONSE),
        }],
      };
    }
  }

  private addEnglishOnlyInstruction(prompt: string): string {
    return `${prompt}\n\nIMPORTANT: Consider ALL the persona characteristics provided when responding. Your response must be in ENGLISH ONLY. Do not use Hindi or any other Indian language words or phrases in your response, not even for greetings or common expressions. Always use English equivalents.`;
  }

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
    throw new Error(`LLM API call failed: ${axiosError.message}`);
  }

  _llmType(): string {
    return 'custom_llm';
  }
}

/**
 * Service to handle handshake process with information agent
 */
@Injectable()
export class HandshakeAgent {
  private readonly logger = new Logger(HandshakeAgent.name);
  private readonly MAX_RETRIES = 3;
  private readonly DEFAULT_DELAY = 1000;
  private readonly MAX_CONVERSATION_TURNS = 16;
  private readonly RECONNECTION_BUFFER_MS = 5000;
  private readonly DEFAULT_QUERY = "Hello, I need information about government schemes that might help me. Can you assist me?";
  private readonly DEFAULT_FOLLOW_UP = "Could you please explain more about what you just mentioned? I'm interested in learning more details.";
  private readonly CONVERSATION_DURATION_MS = 60000; // 1 minute default

  constructor(private readonly informationAgentService: InformationAgentService) {}

  /**
   * Process a handshake request with a single persona
   * @param createHandshakeDto The handshake request data
   * @returns Processed handshake response with conversation
   */
  async processHandshake(createHandshakeDto: CreateHandshakeDto): Promise<HandshakeResponse> {
    this.logger.log(`Processing handshake for persona: ${createHandshakeDto.personaID}`);
    
    // Create a persona object from the DTO fields
    const persona: Persona = {
      personaID: createHandshakeDto.personaID,
      name: createHandshakeDto.name,
      emotions: createHandshakeDto.emotions || [],
      tone: createHandshakeDto.tone || [],
      scenario: createHandshakeDto.scenario
    };
    
    // Generate a base callSid from session ID to ensure uniqueness across different runs
    const baseCallSid = this.generateBaseCallSid(createHandshakeDto.sessionID);
    
    try {
      // Use personaID as the unique identifier for this persona
      const personaId = 1; // Since we only have one persona now
      
      // Generate a stable, unique callSid for this persona
      const stableCallSid = baseCallSid + (personaId * 10000);
      
      const conversationResult = await this.conductConversation(persona, personaId, stableCallSid, createHandshakeDto);
      
      // Cleanup session after conversation ends
      this.informationAgentService.endSession(stableCallSid);
      
      return {
        sessionID: createHandshakeDto.sessionID,
        agentToSpeak: createHandshakeDto.agentToSpeak,
        personas: [conversationResult]
      };
    } catch (error) {
      this.logger.error(`Error in conversation: ${error instanceof Error ? error.message : String(error)}`);
      
      // Attempt to cleanup if we computed a baseCallSid
      try {
        const personaId = 1;
        const stableCallSid = baseCallSid + (personaId * 10000);
        this.informationAgentService.endSession(stableCallSid);
      } catch {}
      
      // Return a partial result with any conversation that was completed before the error
      const errorResult: ConversationResult = {
        id: 1,
        emotions: createHandshakeDto.emotions || [],
        conversation: [],
        error: error instanceof Error ? error.message : String(error)
      };
      
      return {
        sessionID: createHandshakeDto.sessionID,
        agentToSpeak: createHandshakeDto.agentToSpeak,
        personas: [errorResult]
      };
    }
  }

  /**
   * Conducts a conversation between a persona and the information agent
   * @param persona The persona information
   * @param personaId The persona identifier
   * @param callSid The stable call session ID
   * @param dto The handshake request data
   * @returns The conversation result
   */
  private async conductConversation(
    persona: Persona | any, 
    personaId: number, 
    callSid: number, 
    dto: CreateHandshakeDto
  ): Promise<ConversationResult> {
    // Ensure persona is a valid object
    const validPersona = persona && typeof persona === 'object' ? persona : {};
    
    // Initialize the conversation with the Information Agent using the stable callSid
    this.logger.log(`Starting conversation for persona ${personaId} with callSid: ${callSid}`);
    this.logger.debug(`Persona details: ${JSON.stringify(validPersona)}`);
    
    const callId = await this.establishSession(personaId, callSid);
    
    // Initialize conversation chain with LangChain
    const llm = new CustomLLM(validPersona);
    
    // Initialize conversation array
    const conversation: ConversationMessage[] = [];
    
    // Calculate end time for the conversation
    const endTime = Date.now() + this.CONVERSATION_DURATION_MS;
    
    // First message from persona
    const initialQuery = await this.generateInitialQuery(llm, validPersona, validPersona.scenario, personaId);
    
    // Send the first message and record any error responses directly
    const initialResponse = await this.sendMessageWithErrorHandling(
      initialQuery, 
      callId, 
      personaId, 
      callSid
    );
    
    // Add the initial exchange to conversation
    conversation.push({ role: 'user', content: initialQuery });
    conversation.push({ role: 'assistant', content: initialResponse });
    
    // Continue the conversation until time is up
    await this.continueConversation(
      conversation, 
      endTime, 
      llm, 
      validPersona, 
      personaId, 
      callId, 
      callSid
    );
    
    // Extract any dynamic fields to include in the result
    const result: ConversationResult = {
      id: personaId,
      emotions: Array.isArray(validPersona.emotions) ? validPersona.emotions : [],
      conversation
    };
    
    // Include all other properties from the persona in the result
    Object.entries(validPersona).forEach(([key, value]) => {
      // Skip the emotions field as it's already included
      if (key !== 'emotions' && key !== 'conversation' && key !== 'id' && key !== 'error') {
        result[key] = value;
      }
    });
    
    return result;
  }
  
  /**
   * Establishes a session with the information agent with retries
   * @param personaId The persona identifier
   * @param callSid The call session ID
   * @returns The call ID for subsequent messages
   */
  private async establishSession(personaId: number, callSid: number): Promise<number> {
    let retryCount = 0;
    
    // Try to establish a session with retries
    while (retryCount < this.MAX_RETRIES) {
      try {
        // Always use the same callSid for all retries - we don't want to generate a new one
        // The startSession will now return a callId instead of userId
        const callId = await this.informationAgentService.startSession(callSid);
        this.logger.log(`Successfully established session for persona ${personaId}, callSid: ${callSid}, callId: ${callId}`);
        return callId;
      } catch (error) {
        retryCount++;
        if (retryCount >= this.MAX_RETRIES) {
          throw new Error(`Failed to establish session for persona ${personaId} after ${this.MAX_RETRIES} attempts: ${error instanceof Error ? error.message : String(error)}`);
        }
        this.logger.warn(`Session creation attempt ${retryCount} for persona ${personaId} failed, retrying...`);
        await this.delay(this.DEFAULT_DELAY * retryCount); // Exponential backoff
      }
    }
    
    throw new Error(`Failed to establish session after ${this.MAX_RETRIES} attempts`);
  }
  
  /**
   * Continues the conversation until the end time is reached
   * @param conversation The current conversation
   * @param endTime The end time for the conversation
   * @param llm The language model
   * @param persona The persona information
   * @param personaId The persona identifier
   * @param callId The call ID
   * @param callSid The call session ID for reconnection
   */
  private async continueConversation(
    conversation: ConversationMessage[],
    endTime: number,
    llm: CustomLLM,
    persona: Persona | any,
    personaId: number,
    callId: number,
    callSid: number
  ): Promise<void> {
    // Continue the conversation until time is up
    while (Date.now() < endTime) {
      // Check if we have enough conversation turns or if we're close to timeout
      if (conversation.length >= this.MAX_CONVERSATION_TURNS || (Date.now() + this.RECONNECTION_BUFFER_MS) >= endTime) {
        break;
      }
      
      // Generate follow-up based on the assistant's response
      const followUpQuery = await this.generateFollowUp(llm, persona, conversation, personaId);
      
      // Send follow-up message and handle any errors
      const response = await this.sendMessageWithErrorHandling(
        followUpQuery, 
        callId, 
        personaId, 
        callSid
      );
      
      // Add the follow-up exchange to conversation
      conversation.push({ role: 'user', content: followUpQuery });
      conversation.push({ role: 'assistant', content: response });
      
      // Add a small delay to prevent overwhelming the API
      await this.delay(this.DEFAULT_DELAY);
    }
  }
  
  /**
   * Formats persona characteristics into a readable string for the prompt
   * @param persona The persona object with dynamic fields
   * @returns A formatted string of persona characteristics
   */
  private formatPersonaCharacteristics(persona: Persona | any): string {
    if (!persona) return 'Unknown characteristics';
    
    // Check if persona is not an object
    if (typeof persona !== 'object' || persona === null) {
      return `Persona: ${String(persona)}`;
    }
    
    const formattedLines = [];
    
    // Process all fields dynamically without assuming structure
    Object.entries(persona).forEach(([key, value]) => {
      // Skip fields that are undefined, null, or empty arrays/objects
      if (value === undefined || value === null) {
        return;
      } else if (Array.isArray(value) && value.length === 0) {
        return;
      } else if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
        return;
      }
      
      // Format based on value type
      if (typeof value === 'object') {
        // For nested objects (not arrays)
        if (!Array.isArray(value)) {
          try {
            const nestedValues = Object.entries(value)
              .filter(([_, nestedValue]) => nestedValue !== undefined && nestedValue !== null)
              .map(([nestedKey, nestedValue]) => `${nestedKey}: ${nestedValue}`)
              .join(', ');
            
            if (nestedValues) {
              formattedLines.push(`${key}: ${nestedValues}`);
            }
          } catch (error) {
            // If there's an error processing the nested object, just convert to string
            formattedLines.push(`${key}: ${String(value)}`);
          }
        } 
        // For arrays
        else if (Array.isArray(value) && value.length > 0) {
          formattedLines.push(`${key}: ${value.join(', ')}`);
        }
      } 
      // For simple values
      else {
        formattedLines.push(`${key}: ${value}`);
      }
    });
    
    return formattedLines.join('\n');
  }

  /**
   * Generates an initial query based on persona and scenario
   * @param llm The language model
   * @param persona The persona information
   * @param scenario The scenario for the conversation
   * @param personaId The persona identifier
   * @returns The generated initial query
   */
  private async generateInitialQuery(
    llm: CustomLLM, 
    persona: Persona | any, 
    scenario: string, 
    personaId: number
  ): Promise<string> {
    try {
      // Create prompt template for generating conversational queries based on persona
      const personaPrompt = ChatPromptTemplate.fromTemplate(HANDSHAKE_INITIAL_PROMPT_TEMPLATE);
      
      const personaChain = RunnableSequence.from([
        personaPrompt,
        llm,
        new StringOutputParser(),
      ]);
      
      return await personaChain.invoke({
        personaCharacteristics: this.formatPersonaCharacteristics(persona),
        scenario
      });
    } catch (error) {
      this.logger.error(`Error generating initial query for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
      return this.DEFAULT_QUERY;
    }
  }
  
  /**
   * Generates a follow-up message based on the conversation so far
   * @param llm The language model
   * @param persona The persona information
   * @param conversation The current conversation
   * @param personaId The persona identifier
   * @returns The generated follow-up query
   */
  private async generateFollowUp(
    llm: CustomLLM,
    persona: Persona | any,
    conversation: ConversationMessage[],
    personaId: number
  ): Promise<string> {
    try {
      const followUpPrompt = ChatPromptTemplate.fromTemplate(HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE);
      
      const followUpChain = RunnableSequence.from([
        followUpPrompt,
        llm,
        new StringOutputParser(),
      ]);
      
      return await followUpChain.invoke({
        personaCharacteristics: this.formatPersonaCharacteristics(persona),
        conversation: conversation.map(msg => `${msg.role === 'user' ? 'You' : 'Agent'}: ${msg.content}`).join('\n')
      });
    } catch (error) {
      this.logger.error(`Error generating follow-up query for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
      return this.DEFAULT_FOLLOW_UP;
    }
  }
  
  /**
   * Sends a message with proper error handling
   * @param message The message to send
   * @param callId The call ID
   * @param personaId The persona identifier
   * @param callSid The call session ID for reconnection
   * @returns The response from the information agent
   */
  private async sendMessageWithErrorHandling(
    message: string, 
    callId: number, 
    personaId: number, 
    callSid: number
  ): Promise<string> {
    try {
      this.logger.log(`Sending message for persona ${personaId}, callId: ${callId}`);
      return await this.informationAgentService.sendMessage(message, callId);
    } catch (error) {
      this.logger.error(`Error sending message for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Record the actual error message instead of using a generic fallback
      const errorResponse = `Error: ${error instanceof Error ? error.message : String(error)}`;
      
      // Try to reconnect if possible for next iteration but don't change the current response
      await this.attemptReconnection(error, personaId, callSid);
      
      return errorResponse;
    }
  }
  
  /**
   * Attempts to reconnect if certain errors are encountered
   * @param error The error that occurred
   * @param personaId The persona identifier
   * @param callSid The call session ID
   */
  private async attemptReconnection(error: unknown, personaId: number, callSid: number): Promise<void> {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (errorMsg.includes('No response received') || errorMsg.includes('Failed to send message')) {
      this.logger.warn(`Attempting to reconnect for persona ${personaId} due to error`);
      const newCallId = await this.informationAgentService.reconnect(callSid);
      if (newCallId) {
        this.logger.log(`Reconnected for persona ${personaId} with new callId: ${newCallId}`);
      }
    }
  }
  
  /**
   * Parses a duration string into seconds
   * @param durationString The duration string to parse
   * @returns The duration in seconds
   */
  private parseDuration(durationString: string): number {
    // Parse duration like "30 seconds", "2 minutes", etc.
    const match = durationString.match(/(\d+)\s+(second|minute|hour)s?/i);
    if (!match) return 30; // Default to 30 seconds
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'second': return value;
      case 'minute': return value * 60;
      case 'hour': return value * 3600;
      default: return 30;
    }
  }
  
  /**
   * Creates a delay
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Generates a base callSid from session ID
   * @param sessionId The session ID
   * @returns A base callSid
   */
  private generateBaseCallSid(sessionId: string | number | undefined): number {
    if (sessionId === undefined || sessionId === null) {
      return Date.now();
    }

    // Try numeric parse first
    const parsed = parseInt(sessionId.toString(), 10);
    if (!Number.isNaN(parsed)) {
      return parsed * 1000000;
    }

    // Fallback: stable hash of the string
    const str = sessionId.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32-bit int
    }

    // Ensure positive and scale to avoid collision with small numbers
    const positiveHash = Math.abs(hash);
    // Mix with current time low bits to reduce collision across time without losing stability per request
    return (positiveHash % 1000000000) * 1000 + (Date.now() % 1000);
  }
}
