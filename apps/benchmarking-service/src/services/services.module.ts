import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache/cache.service';
import { ModelService } from './model/model.service';
import { QdrantService } from './qdrant/qdrant.service';
import { ExcelService } from './excel/excel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCase } from '../domain/test-case/entities/test-case.entity';
import { EventEmitterModule } from './event-emitter/event-emitter.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([TestCase]),
    EventEmitterModule,
  ],
  providers: [
    CacheService,
    ModelService,
    QdrantService,
    ExcelService,
  ],
  exports: [
    CacheService,
    ModelService,
    QdrantService,
    ExcelService,
  ],
})
export class ServicesModule {} 