import { IsArray, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePersonaDto {
    @IsInt()
    count: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    fields?: string[];

    @IsString()
    @IsOptional()
    scenario?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    emotions?: string[];
}