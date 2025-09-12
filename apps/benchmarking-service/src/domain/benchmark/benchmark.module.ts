import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenchmarkService } from './benchmark.service';
import { BenchmarkController } from './benchmark.controller';
import { Session } from '../session/entities/session.entity';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { ServicesModule } from '../../services/services.module';
import { EventEmitterModule } from '../../services/event-emitter/event-emitter.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, TestCase, Evaluation]),
    ServicesModule,
    EventEmitterModule,
  ],
  controllers: [BenchmarkController],
  providers: [BenchmarkService],
  exports: [BenchmarkService],
})
export class BenchmarkModule {} 