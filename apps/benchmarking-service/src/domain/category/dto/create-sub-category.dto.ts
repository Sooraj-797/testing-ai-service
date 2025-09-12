import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ description: 'Name of the subcategory' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the subcategory', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID of the parent category' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
} 