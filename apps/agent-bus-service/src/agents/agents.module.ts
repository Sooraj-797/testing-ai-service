import { Module } from '@nestjs/common';
import { PersonaAgent } from './persona.agent';
import { LLMModule } from '../domain/llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [PersonaAgent],
  exports: [PersonaAgent],
})
export class AgentsModule {} 