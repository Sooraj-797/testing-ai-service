import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgentBusController } from './agent-bus.controller';
import { AgentBusService } from './agent-bus.service';
import { LlmModule } from '../llm/llm.module';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [
    HttpModule,
    AgentsModule,
    LlmModule,
  ],
  controllers: [AgentBusController],
  providers: [AgentBusService],
  exports: [AgentBusService],
})
export class AgentBusModule {}