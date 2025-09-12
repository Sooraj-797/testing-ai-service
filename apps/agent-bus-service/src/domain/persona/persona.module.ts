import { Module } from "@nestjs/common";
import { PersonaAgent } from "../../agents/persona.agent";
import { PersonaController } from "./persona.controller";
import { PersonaService } from "./persona.service";

@Module({
    imports: [],
    controllers: [PersonaController],
    providers: [PersonaService, PersonaAgent],
    exports: [PersonaService]
})
export class PersonaModule {}