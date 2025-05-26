import { Module } from '@nestjs/common';
import { AgentBusModule } from './domain/agent-bus/agent-bus.module';

@Module({
  imports: [
    AgentBusModule,
  ],
})
export class AppModule {}
