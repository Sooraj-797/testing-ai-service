import { Module } from '@nestjs/common';
import { AgentBusModule } from './domain/agent-bus-service/agent-bus.module';

@Module({
  imports: [
    AgentBusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
