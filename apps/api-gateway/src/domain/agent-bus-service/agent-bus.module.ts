import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PersonaController } from './persona/persona.controller';
import { HandshakeController } from './handshake/handshake.controller';
import { EvaluationController } from './evaluation/evaluation.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AGENT_BUS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AGENT_BUS_HOST || 'localhost',
          port: process.env.AGENT_BUS_PORT ? parseInt(process.env.AGENT_BUS_PORT, 10) : 3001,
        },
      },
    ]),
  ],
  controllers: [PersonaController, HandshakeController, EvaluationController],
})
export class AgentBusModule {} 