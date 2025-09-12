import { Body, Controller, Inject, Logger, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreatePersonaDto } from "apps/agent-bus-service/src/domain/persona/dto/create-persona.dto";
import { Observable, firstValueFrom } from "rxjs";

@Controller('persona')
export class PersonaController {
    private readonly logger = new Logger(PersonaController.name);

    constructor(
        @Inject('AGENT_BUS_SERVICE') private readonly agentBusService: ClientProxy
    ) {}

    @Post('generate')
    async generatePersonas(@Body() createPersonaDto: CreatePersonaDto): Promise<any> {
        try {
            this.logger.log(`Generating personas with data: ${JSON.stringify(createPersonaDto)}`);
            const result = await firstValueFrom(
                this.agentBusService.send('generatePersonas', createPersonaDto));
            return result;
        } catch (error) {
            this.logger.error(`Failed to get response from persona service: ${error.message}`);
            throw new Error(`Failed to get response from persona service: ${error.message}`);
        }
    }
}