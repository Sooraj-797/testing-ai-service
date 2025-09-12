import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationTemplateDto {
    @IsNumber()
    @IsNotEmpty()
    sessionID: number;

    @IsOptional()
    file?: Express.Multer.File;

    @IsString()
    @IsOptional()
    buffer?: string;

    @IsString()
    @IsOptional()
    originalname?: string;

    @IsString()
    @IsOptional()
    mimetype?: string;
} 