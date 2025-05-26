import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { PersonaAgent, Persona } from "../../agents/persona.agent";
import { catchError, firstValueFrom, map, throwError } from "rxjs";
import { AxiosError } from "axios";

@Injectable()
export class AgentBusService {
    private readonly logger = new Logger(AgentBusService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly personaAgent: PersonaAgent
    ) {}

    async createPersona(createPersonaDto: CreatePersonaDto): Promise<Persona[]> {
        this.logger.log('Creating personas', createPersonaDto);
        
        try {
            // Use the PersonaAgent to generate personas
            const personas = await this.personaAgent.generatePersonas(createPersonaDto);
            
            // Log the result
            this.logger.log(`Successfully created ${personas.length} personas`);
            
            return personas;
        } catch (error) {
            this.logger.error(`Error creating personas: ${error.message}`, error.stack);
            throw error;
        }
    }
}