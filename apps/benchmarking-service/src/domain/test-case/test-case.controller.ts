import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadTestCasesDto } from './dto/upload-test-cases.dto';
import { TestCaseService } from './test-case.service';

@Controller()
export class TestCaseController {
  constructor(private readonly testCaseService: TestCaseService) {}

  @MessagePattern('upload_test_cases')
  async uploadTestCases(
    @Payload() payload: { dto: UploadTestCasesDto; file: any }
  ) {
    return this.testCaseService.processTestCasesFile(
      payload.file,
      payload.dto.sessionId
    );
  }

  @MessagePattern('get_test_cases_by_session')
  async getTestCasesBySession(@Payload() sessionId: string) {
    return this.testCaseService.getTestCasesBySession(sessionId);
  }

  @MessagePattern('get_test_cases_by_subcategory')
  async getTestCasesBySubcategory(@Payload() subCategoryId: string) {
    return this.testCaseService.getTestCasesBySubcategory(subCategoryId);
  }
} 