import { Module } from '@nestjs/common';
import { HandshakeController } from './handshake.controller';
import { HandshakeService } from './handshake.service';
import { AgentsModule } from '../../agents/agents.module';

@Module({
  imports: [AgentsModule],
  controllers: [HandshakeController],
  providers: [HandshakeService],
  exports: [HandshakeService],
})
export class HandshakeModule {}
