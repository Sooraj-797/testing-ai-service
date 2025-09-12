import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateEvaluationTemplateDto } from './dto/create-evaluation-template.dto';

@Controller()
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @MessagePattern('evaluateConversations')
  async evaluateConversations(@Payload() createEvaluationDto: CreateEvaluationDto): Promise<any> {
    return this.evaluationService.evaluateConversations(createEvaluationDto);
  }

  @MessagePattern('uploadEvaluationTemplate')
  async uploadEvaluationTemplate(@Payload() fileData: CreateEvaluationTemplateDto): Promise<any> {
    return this.evaluationService.uploadEvaluationTemplate(fileData);
  }

  @MessagePattern('getEvaluationTemplate')
  async getEvaluationTemplate(@Payload() sessionID: number): Promise<any> {
    return this.evaluationService.getEvaluationTemplate(sessionID);
  }
} 