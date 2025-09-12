import { Module } from '@nestjs/common';
import { PersonaModule } from './domain/persona/persona.module';
import { PersonaController } from './domain/persona/persona.controller';
import { HandshakeModule } from './domain/handshake/handshake.module';
import { HandshakeController } from './domain/handshake/handshake.controller';
import { EvaluationModule } from './domain/evaluation/evaluation.module';
import { EvaluationController } from './domain/evaluation/evaluation.controller';

@Module({
  imports: [
    PersonaModule,
    HandshakeModule,
    EvaluationModule,
  ],
  controllers: [
    PersonaController,
    HandshakeController,
    EvaluationController,
  ],
})
export class AppModule {}
