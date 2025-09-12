import { Injectable, Logger } from "@nestjs/common";
import { PersonaAgent } from "../../agents/persona.agent";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { error } from "console";

@Injectable()
export class PersonaService {

    private readonly logger = new Logger(PersonaService.name);

  constructor(private readonly personaAgent: PersonaAgent) {}

  async generatePersonas(createPersonaDto: CreatePersonaDto): Promise<any> {
    try {
        const personas = await this.personaAgent.generatePersonas(createPersonaDto);
        return personas;
    } catch (error) {
        this.logger.error(`Failed to generate personas: ${error.message}`);
        throw new Error(`Failed to generate personas: ${error.message}`);
    }

  }

}
