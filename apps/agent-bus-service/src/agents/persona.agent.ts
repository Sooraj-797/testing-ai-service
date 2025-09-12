import { Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models';
import { BaseMessage, AIMessage, HumanMessage } from '@langchain/core/messages';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { ChatGeneration, ChatResult } from '@langchain/core/outputs';
import { CreatePersonaDto } from '../domain/persona/dto/create-persona.dto';
import { PERSONA_PROMPT_TEMPLATE } from '../constants/llm.constants';
import axios from 'axios';

class CustomLLM extends BaseChatModel {
  async _generate(
    messages: BaseMessage[], 
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const messageContent = messages[messages.length - 1].content;
    
    try {
      const response = await axios.post(process.env.PERSONA_LLM_URL || 'https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview', {
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
        temperature: 0.7,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.PERSONA_LLM_API_KEY || '',
        },
      });

      const content = response.data.choices[0].message.content;
      console.log(content);
      return {
        generations: [{
          text: content,
          message: new AIMessage(content),
        }],
      };
    } catch (error) {
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  _llmType(): string {
    return 'custom_llm';
  }
}

@Injectable()
export class PersonaAgent {
  private llm: CustomLLM;
  private personaChain: RunnableSequence;

  constructor() {
    this.llm = new CustomLLM({});

    const personaPrompt = ChatPromptTemplate.fromTemplate(PERSONA_PROMPT_TEMPLATE);

    this.personaChain = RunnableSequence.from([
      personaPrompt,
      this.llm,
      new StringOutputParser(),
    ]);
  }

  async generatePersonas(createPersonaDto: CreatePersonaDto): Promise<any> {
    try {
      const result = await this.personaChain.invoke({
        count: createPersonaDto.count,
        name: createPersonaDto.name,
        emotions: JSON.stringify(createPersonaDto.emotions),
        tone: JSON.stringify(createPersonaDto.tone),
        scenario: createPersonaDto.scenario,
        sessionID: createPersonaDto.sessionID,
      });

      // Try to extract JSON if the response contains text before or after the JSON
      try {
        const parsedResult = JSON.parse(result);
        
        // Check if the response has a personas array
        if (parsedResult.personas && Array.isArray(parsedResult.personas)) {
          // Add unique IDs to each persona in the array
          parsedResult.personas = parsedResult.personas.map((persona, index) => ({
            id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
            ...persona
          }));
          return parsedResult;
        } 
        // Check if the response itself is an array of personas
        else if (Array.isArray(parsedResult)) {
          return parsedResult.map((persona, index) => ({
            id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
            ...persona
          }));
        } 
        // Single persona or unknown structure
        else {
          return parsedResult;
        }
      } catch (error) {
        // Try to extract JSON from the response if it's embedded in text
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResult = JSON.parse(jsonMatch[0]);
          
          // Check if the response has a personas array
          if (parsedResult.personas && Array.isArray(parsedResult.personas)) {
            // Add unique IDs to each persona in the array
            parsedResult.personas = parsedResult.personas.map((persona, index) => ({
              id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
              ...persona
            }));
            return parsedResult;
          } 
          // Check if the response itself is an array of personas
          else if (Array.isArray(parsedResult)) {
            return parsedResult.map((persona, index) => ({
              id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
              ...persona
            }));
          } 
          // Single persona or unknown structure
          else {
            return parsedResult;
          }
        }
        throw new Error(`Invalid JSON response from LLM: ${result.substring(0, 100)}...`);
      }
    } catch (error) {
      throw new Error(`Failed to generate personas: ${error.message}`);
    }
  }
}