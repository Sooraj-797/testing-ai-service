import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: 'Name of the benchmark session' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the benchmark session', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID of the in-house model to benchmark' })
  @IsNotEmpty()
  @IsString()
  inHouseModelId: string;

  @ApiProperty({ description: 'ID of the baseline model to benchmark against' })
  @IsNotEmpty()
  @IsString()
  baselineModelId: string;
} 