import { Body, Controller, Logger, Post } from "@nestjs/common";
import { AgentBusService } from "./agent-bus.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { Persona } from "../../agents/persona.agent";

interface PersonaResponse {
    success: boolean;
    personas: Persona[];
    error?: string;
}

@Controller('agent-bus')
export class AgentBusController {

    private readonly logger = new Logger(AgentBusController.name);

    constructor(private readonly agentBusService: AgentBusService) {}

    @Post('create-persona')
    async createPersonaController(@Body() createPersonaDto: CreatePersonaDto): Promise<PersonaResponse> {
        this.logger.log('createPersonaController called', createPersonaDto);
        
        try {
            const personas = await this.agentBusService.createPersona(createPersonaDto);
            
            return {
                success: true,
                personas
            };
        } catch (error) {
            this.logger.error(`Error in createPersonaController: ${error.message}`, error.stack);
            
            return {
                success: false,
                personas: [],
                error: error.message
            };
        }
    }
}