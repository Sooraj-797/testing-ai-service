import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadTestCasesDto {
  @ApiProperty({ description: 'Session ID to associate test cases with' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  // The file will be handled by the controller using @UploadedFile() decorator
} 