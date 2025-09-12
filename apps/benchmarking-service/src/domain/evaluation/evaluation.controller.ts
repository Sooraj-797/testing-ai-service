import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EvaluationService } from './evaluation.service';

@Controller()
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @MessagePattern('get_evaluations_by_session')
  async getEvaluationsBySession(@Payload() sessionId: string) {
    return this.evaluationService.getEvaluationsBySession(sessionId);
  }

  @MessagePattern('get_evaluations_by_test_case')
  async getEvaluationsByTestCase(@Payload() testCaseId: string) {
    return this.evaluationService.getEvaluationsByTestCase(testCaseId);
  }

  @MessagePattern('get_evaluation_results')
  async getEvaluationResults(@Payload() sessionId: string) {
    return this.evaluationService.getEvaluationResults(sessionId);
  }
} 