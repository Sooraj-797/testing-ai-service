import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { TestCase } from '../../domain/test-case/entities/test-case.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface TestCaseRow {
  prompt: string;
  subCategoryId: string;
  description?: string;
  expectedOutput?: string;
}

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
  ) {}

  /**
   * Process Excel file and extract test cases
   * @param file The uploaded Excel file
   * @param sessionId The session ID to associate test cases with
   * @returns Array of created test cases
   */
  async processTestCasesExcel(file: Express.Multer.File, sessionId: string): Promise<TestCase[]> {
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<TestCaseRow>(worksheet);

      if (!data || data.length === 0) {
        throw new Error('Excel file is empty or has invalid format');
      }

      // Validate expected columns
      this.validateExcelFormat(data[0]);

      const testCases: TestCase[] = [];

      for (const row of data) {
        // Skip rows with missing required fields
        if (!row.prompt || !row.subCategoryId) {
          this.logger.warn('Skipping row with missing required fields');
          continue;
        }

        const testCase = this.testCaseRepository.create({
          prompt: row.prompt,
          description: row.description || null,
          expectedOutput: row.expectedOutput || null,
          sessionId,
          subCategoryId: row.subCategoryId,
        });

        testCases.push(testCase);
      }

      // Save all test cases in a single transaction
      return await this.testCaseRepository.save(testCases);
    } catch (error) {
      this.logger.error(`Failed to process Excel file: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate that the Excel file has the expected format
   * @param firstRow The first row of the Excel file
   */
  private validateExcelFormat(firstRow: TestCaseRow): void {
    const requiredColumns = ['prompt', 'subCategoryId'];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      throw new Error(`Excel file is missing required columns: ${missingColumns.join(', ')}`);
    }
  }
} 