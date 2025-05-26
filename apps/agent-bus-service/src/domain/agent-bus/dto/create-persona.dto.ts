import { IsArray, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreatePersonaDto {
    @IsInt()
    count: number;

    @IsString()
    context: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    fields?: string[];

    @IsObject()
    @IsOptional()
    constraints?: Record<string, string[] | number[] | boolean[]>;

    @IsString()
    scenario?: string;

    @IsArray()
    @IsOptional()
    emotions?: string[];
}