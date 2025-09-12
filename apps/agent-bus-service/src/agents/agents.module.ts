import { Module } from '@nestjs/common';
import { PersonaAgent } from './persona.agent';
import { HandshakeAgent } from './handshake.agent';
import { EvaluationAgent } from './evaluation.agent';
import { InformationAgentService } from './services/information-agent.service';

@Module({
  providers: [PersonaAgent, HandshakeAgent, EvaluationAgent, InformationAgentService],
  exports: [PersonaAgent, HandshakeAgent, EvaluationAgent],
})
export class AgentsModule {} 