import { Module } from '@nestjs/common';
import { PersonaAgent } from './persona.agent';
import { LlmModule } from '../domain/llm/llm.module';

@Module({
  imports: [LlmModule],
  providers: [PersonaAgent],
  exports: [PersonaAgent],
})
export class AgentsModule {} 