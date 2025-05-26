import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AgentBusController } from './agent-bus.controller';
import { AgentBusService } from './agent-bus.service';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [
    HttpModule,
    AgentsModule,
  ],
  controllers: [AgentBusController],
  providers: [AgentBusService],
  exports: [AgentBusService],
})
export class AgentBusModule {}