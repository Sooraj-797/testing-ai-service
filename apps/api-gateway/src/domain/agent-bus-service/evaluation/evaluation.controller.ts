import { Controller, Post, Body, Logger, Inject, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateEvaluationTemplateDto } from 'apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation-template.dto';
import { CreateEvaluationDto } from 'apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto';
import { firstValueFrom } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as path from 'path';

@Controller('evaluation')
export class EvaluationController {
  private readonly logger = new Logger(EvaluationController.name);

  constructor(
    @Inject('AGENT_BUS_SERVICE') private readonly evaluationService: ClientProxy) {}

  @Post('conversations')
  async evaluateConversation(@Body() createEvaluationDto: CreateEvaluationDto): Promise<any> {
    this.logger.log(`Received evaluation request for session ${createEvaluationDto.sessionID}`);
    try {
      const result = await firstValueFrom(
        this.evaluationService.send('evaluateConversations', createEvaluationDto)
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get response from evaluation service: ${error.message}`);
      throw error;
    }
  }

  @Post('upload-template')
  @UseInterceptors(FileInterceptor('file'))
  async uploadEvaluationTemplate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB max
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
    @Body() body: { sessionID: number }
  ): Promise<any> {
    try {
      // Validate file extension manually
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          `Invalid file extension. Allowed extensions are: ${allowedExtensions.join(', ')}`, 
          HttpStatus.BAD_REQUEST
        );
      }
      
      const fileData: CreateEvaluationTemplateDto = {
        sessionID: parseInt(body.sessionID.toString(), 10),
        file,
        buffer: file.buffer.toString('base64'),
        originalname: file.originalname,
        mimetype: file.mimetype
      };

      this.logger.log(`Uploading template file ${file.originalname} for session ${fileData.sessionID}`);
      
      const result = await firstValueFrom(
        this.evaluationService.send('uploadEvaluationTemplate', fileData)
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to upload template: ${error.message}`);
      throw error;
    }
  }
}
