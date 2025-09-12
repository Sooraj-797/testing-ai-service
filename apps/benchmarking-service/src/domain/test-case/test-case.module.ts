import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCase } from './entities/test-case.entity';
import { TestCaseService } from './test-case.service';
import { TestCaseController } from './test-case.controller';
import { ServicesModule } from '../../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TestCase]),
    ServicesModule,
  ],
  controllers: [TestCaseController],
  providers: [TestCaseService],
  exports: [TestCaseService],
})
export class TestCaseModule {} 