import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class StartBenchmarkDto {
  @ApiProperty({ description: 'Session ID to run benchmark for' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({ description: 'Number of top chunks to retrieve from Qdrant', default: 3 })
  @IsOptional()
  @IsNumber()
  topK?: number = 3;
} 