import { Injectable, Logger } from '@nestjs/common';
import { LLMService, LLMMessage } from '../domain/llm/llm.service';
import { CreatePersonaDto } from '../domain/agent-bus/dto/create-persona.dto';

export interface Persona {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  background: string;
  personality: string;
  [key: string]: any;
}

@Injectable()
export class PersonaAgent {
  private readonly logger = new Logger(PersonaAgent.name);

  constructor(private readonly llmService: LLMService) {}

  /**
   * Generate multiple personas based on the provided criteria
   * @param createPersonaDto Data transfer object containing persona creation parameters
   * @returns An array of generated personas
   */
  async generatePersonas(createPersonaDto: CreatePersonaDto): Promise<Persona[]> {
    const { count, context, fields, constraints, scenario, emotions } = createPersonaDto;
    
    this.logger.log(`Generating ${count} personas with context: ${context}`);
    
    const personas: Persona[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        // Construct the prompt for persona generation
        let prompt = `Create a detailed fictional persona in the following context: ${context}.\n\n`;
        
        if (fields && fields.length > 0) {
          prompt += `Include the following fields in your response:\n${fields.join('\n')}\n\n`;
        } else {
          prompt += 'Include name, age, gender, occupation, background, and personality in your response.\n\n';
        }
        
        if (constraints && Object.keys(constraints).length > 0) {
          prompt += 'Apply the following constraints:\n';
          for (const [field, values] of Object.entries(constraints)) {
            prompt += `- ${field} must be one of: ${values.join(', ')}\n`;
          }
          prompt += '\n';
        }
        
        if (scenario) {
          prompt += `The persona should be suitable for this scenario: ${scenario}\n\n`;
        }
        
        if (emotions && emotions.length > 0) {
          prompt += `The persona should exhibit these emotions or emotional traits: ${emotions.join(', ')}\n\n`;
        }
        
        prompt += 'Format your response as a JSON object with the specified fields.';
        
        // Call the LLM service to generate the persona
        const response = await this.llmService.generateCompletion([
          {
            role: 'system',
            content: 'You are an expert at creating detailed, realistic fictional personas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]);
        
        // Parse the response
        const persona = this.parsePersonaResponse(response.choices[0].message.content, fields || []);
        
        personas.push(persona);
        this.logger.log(`Generated persona ${i + 1}/${count}: ${persona.name}`);
      } catch (error) {
        this.logger.error(`Error generating persona ${i + 1}/${count}: ${error.message}`, error.stack);
      }
    }
    
    return personas;
  }

  /**
   * Parse the LLM response to extract the persona
   */
  private parsePersonaResponse(content: string, requiredFields: string[]): Persona {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedPersona = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields are present
        const defaultFields = ['name', 'age', 'gender', 'occupation', 'background', 'personality'];
        const fieldsToCheck = requiredFields.length > 0 ? requiredFields : defaultFields;
        
        for (const field of fieldsToCheck) {
          if (!parsedPersona[field]) {
            this.logger.warn(`Generated persona missing required field: ${field}`);
          }
        }
        
        return parsedPersona;
      }
      
      // If no JSON found, create a simple object with the content
      this.logger.warn('Could not parse JSON from LLM response, returning raw content');
      return {
        name: 'Unknown',
        age: 0,
        gender: 'Unknown',
        occupation: 'Unknown',
        background: 'Unknown',
        personality: 'Unknown',
        raw_content: content
      };
    } catch (error) {
      this.logger.error(`Error parsing persona response: ${error.message}`, error.stack);
      throw new Error(`Failed to parse persona from LLM response: ${error.message}`);
    }
  }
}
