import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from './services/event-emitter/event-emitter.module';

import { SessionModule } from './domain/session/session.module';
import { CategoryModule } from './domain/category/category.module';
import { TestCaseModule } from './domain/test-case/test-case.module';
import { EvaluationModule } from './domain/evaluation/evaluation.module';
import { BenchmarkModule } from './domain/benchmark/benchmark.module';
import { ServicesModule } from './services/services.module';

// Entities
import { Session } from './domain/session/entities/session.entity';
import { Category } from './domain/category/entities/category.entity';
import { SubCategory } from './domain/category/entities/sub-category.entity';
import { TestCase } from './domain/test-case/entities/test-case.entity';
import { Evaluation } from './domain/evaluation/entities/evaluation.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 5432),
                username: configService.get('DB_USERNAME', 'postgres'),
                password: configService.get('DB_PASSWORD', 'postgres'),
                database: configService.get('DB_NAME', 'benchmarking'),
                entities: [Session, Category, SubCategory, TestCase, Evaluation],
                synchronize: configService.get('DB_SYNC', 'false') === 'true',
            }),
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'single',
                url: `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`,
                password: configService.get('REDIS_PASSWORD', ''),
            }),
        }),
        HttpModule,
        EventEmitterModule,
        ServicesModule,
        SessionModule,
        CategoryModule,
        TestCaseModule,
        EvaluationModule,
        BenchmarkModule,
    ],
    controllers: [],
})

export class AppModule {}