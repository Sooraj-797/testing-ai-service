import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../domain/llm/llm.service';
import { CreatePersonaDto } from '../domain/agent-bus/dto/create-persona.dto';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';

// Define the structure of a persona
export interface Persona {
    [key: string]: any;
}

// Define a type for nested fields
interface NestedField {
    [key: string]: string[] | NestedField;
}

// Define persona generation parameters
interface PersonaGenerationParams {
    count: number;
    fields: string;
    scenario: string;
    emotions: string;
}

// Define a schema for persona validation
const personaSchema = z.array(
    z.record(z.any())
);

@Injectable()
export class PersonaAgent {
    private readonly logger = new Logger(PersonaAgent.name);
    private readonly outputParser = new StringOutputParser();

    constructor(private readonly llmService: LlmService) {}

    /**
     * Generate multiple personas based on the input criteria using Model Context Protocol
     */
    async generatePersonas(createPersonaDto: CreatePersonaDto): Promise<Persona[]> {
        this.logger.log(`Generating ${createPersonaDto.count} personas`);

        try {
            // Get the list of fields or use default fields if none provided
            const fields = createPersonaDto.fields || ['name', 'age'];
            
            // Define the parameters for persona generation
            const params: PersonaGenerationParams = {
                count: createPersonaDto.count,
                fields: JSON.stringify(fields),
                scenario: createPersonaDto.scenario || 'Create general personas',
                emotions: JSON.stringify(createPersonaDto.emotions || [])
            };
            
            // Create the prompt chain for persona generation
            const promptTemplate = await this.createPersonaPromptTemplate(createPersonaDto);
            
            // Generate the personas using the LLM service and prompt template
            const response = await this.llmService.runPromptTemplate(promptTemplate, params);
            
            // Parse and validate the response
            const personas = await this.parsePersonaResponse(response, createPersonaDto.count);
            
            this.logger.log(`Successfully generated ${personas.length} personas`);
            return personas;
        } catch (error) {
            this.logger.error(`Error generating personas: ${error.message}`, error.stack);
            throw new Error(`Failed to generate personas: ${error.message}`);
        }
    }

    /**
     * Create the prompt template for persona generation using LangChain
     */
    private async createPersonaPromptTemplate(dto: CreatePersonaDto): Promise<ChatPromptTemplate> {
        // Create a system message that guides the LLM to generate personas
        const systemTemplate = `You are a persona generation assistant that creates detailed, realistic personas based on specific requirements.
Your task is to generate {count} different personas with the following attributes: {fields}.
${dto.scenario ? 'Consider this scenario: {scenario}' : ''}
${dto.emotions?.length ? 'Include one of these emotions for each persona: {emotions}' : ''}

Follow these guidelines:
1. Create exactly {count} unique personas
2. For each persona, include ONLY the fields specified in the fields list
3. Make each persona realistic, diverse, and appropriate for the scenario
4. If location details are requested, include appropriate geographic information
5. Format your response as a valid JSON array of objects, with each object representing one persona
6. Ensure all the requested fields are present in each persona object
7. Do not include any fields that were not requested

Example format of your response:
[
  {
    "field1": "value1",
    "field2": "value2",
    "nestedField": {
      "subfield1": "value",
      "subfield2": "value"
    }
  },
  {
    "field1": "value1",
    "field2": "value2",
    ...
  }
]`;

        const humanTemplate = `Please generate {count} unique personas with the fields {fields}.
${dto.scenario ? 'Scenario: {scenario}' : ''}
${dto.emotions?.length ? 'Emotions to include: {emotions}' : ''}`;

        // Create a chat prompt template using LangChain
        return ChatPromptTemplate.fromMessages([
            SystemMessagePromptTemplate.fromTemplate(systemTemplate),
            HumanMessagePromptTemplate.fromTemplate(humanTemplate)
        ]);
    }

    /**
     * Parse and validate the LLM response to extract personas
     */
    private async parsePersonaResponse(response: string, expectedCount: number): Promise<Persona[]> {
        try {
            let personas: Persona[];
            
            // Attempt to parse the JSON response
            try {
                // Try to find and extract a JSON array from the response
                const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
                if (jsonMatch) {
                    personas = JSON.parse(jsonMatch[0]);
                } else {
                    // If no JSON array found, try parsing the entire response
                    personas = JSON.parse(response);
                }
                
                // Validate the personas against our schema
                const validationResult = personaSchema.safeParse(personas);
                if (!validationResult.success) {
                    throw new Error(`Invalid persona format: ${validationResult.error.message}`);
                }
            } catch (parseError) {
                this.logger.error(`Error parsing JSON response: ${parseError.message}`, response);
                throw new Error(`Failed to parse personas response: ${parseError.message}`);
            }
            
            // Validate that we got an array
            if (!Array.isArray(personas)) {
                throw new Error('Response is not an array of personas');
            }
            
            // Check if we got the expected number of personas
            if (personas.length < expectedCount) {
                this.logger.warn(`Expected ${expectedCount} personas but received ${personas.length}`);
            }
            
            return personas;
        } catch (error) {
            this.logger.error(`Error parsing persona response: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Process nested fields like location details
     */
    private processNestedFields(fields: string[]): (string | NestedField)[] {
        const result: (string | NestedField)[] = [];
        
        for (const field of fields) {
            // Check if field contains a nested structure notation
            if (field.includes('.')) {
                const parts = field.split('.');
                const rootField = parts[0];
                
                // Find if we already have this root field in our results
                let nestedField = result.find(f => 
                    typeof f === 'object' && Object.keys(f)[0] === rootField
                ) as NestedField | undefined;
                
                // If not, create it
                if (!nestedField) {
                    nestedField = { [rootField]: {} };
                    result.push(nestedField);
                }
                
                // Add the nested field
                const nestedParts = parts.slice(1);
                let current = nestedField[rootField] as NestedField;
                
                for (let i = 0; i < nestedParts.length - 1; i++) {
                    const part = nestedParts[i];
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part] as NestedField;
                }
                
                // Add the leaf field
                const leafField = nestedParts[nestedParts.length - 1];
                if (!current[leafField]) {
                    current[leafField] = [];
                }
            } else {
                // Simple field, just add it
                result.push(field);
            }
        }
        
        return result;
    }
}
