import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase } from './entities/test-case.entity';
import { ExcelService } from '../../services/excel/excel.service';

@Injectable()
export class TestCaseService {
  private readonly logger = new Logger(TestCaseService.name);

  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    private readonly excelService: ExcelService,
  ) {}

  /**
   * Process uploaded test cases file
   * @param file Uploaded Excel file
   * @param sessionId Session ID to associate test cases with
   * @returns Array of created test cases
   */
  async processTestCasesFile(file: any, sessionId: string): Promise<TestCase[]> {
    try {
      return await this.excelService.processTestCasesExcel(file, sessionId);
    } catch (error) {
      this.logger.error(`Failed to process test cases file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get test cases by session
   * @param sessionId Session ID
   * @returns Array of test cases
   */
  async getTestCasesBySession(sessionId: string): Promise<TestCase[]> {
    try {
      return await this.testCaseRepository.find({
        where: { sessionId },
        relations: ['subCategory', 'subCategory.category'],
      });
    } catch (error) {
      this.logger.error(`Failed to get test cases by session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get test cases by subcategory
   * @param subCategoryId Subcategory ID
   * @returns Array of test cases
   */
  async getTestCasesBySubcategory(subCategoryId: string): Promise<TestCase[]> {
    try {
      return await this.testCaseRepository.find({
        where: { subCategoryId },
      });
    } catch (error) {
      this.logger.error(`Failed to get test cases by subcategory: ${error.message}`);
      throw error;
    }
  }
} 