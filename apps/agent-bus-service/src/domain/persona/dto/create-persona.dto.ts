import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePersonaDto {
  @IsInt()
  @IsNotEmpty()
  sessionID: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  count: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  emotions: string[];

  @IsArray()
  tone: string[];

  @IsString()
  @IsNotEmpty()
  scenario: string;
}
