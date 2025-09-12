import { IsArray, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class DynamicField {
    [key: string]: any;
}

export class CreateHandshakeDto {
    @IsInt()
    @IsNotEmpty()
    sessionID: number;

    @IsString()
    @IsNotEmpty()
    agentToSpeak: string; 

    @IsString()
    @IsNotEmpty()
    personaID: string; 

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