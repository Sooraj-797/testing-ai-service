import { Body, Controller, Logger, Post } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { PersonaService } from "./persona.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";

@Controller()
export class PersonaController {

    private readonly logger = new Logger(PersonaController.name);

    constructor(private readonly personaService: PersonaService) {}

    @MessagePattern('generatePersonas')
    async generatePersonas(@Payload() createPersonaDto: CreatePersonaDto){
        try {
            const personas = await this.personaService.generatePersonas(createPersonaDto);
            return personas;
        } catch (error) {
            this.logger.error(`Failed to get response from persona service: ${error.message}`);
            throw new Error(`Failed to get response from persona service: ${error.message}`);
        }
    }
}