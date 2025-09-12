import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ConversationMessage {
    @IsString()
    @IsNotEmpty()
    @IsIn(['user', 'assistant'])
    role: 'user' | 'assistant';

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class CreateEvaluationDto {
    @IsNumber()
    @IsNotEmpty()
    sessionID: number;

    @IsString()
    @IsNotEmpty()
    personaID: string;

    @IsString()
    @IsNotEmpty()
    agent: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConversationMessage)
    conversation: ConversationMessage[];

    @IsString()
    @IsNotEmpty()
    scenario: string;
} 