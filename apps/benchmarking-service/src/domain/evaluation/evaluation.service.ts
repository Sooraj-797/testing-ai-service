import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  /**
   * Get evaluations by session
   * @param sessionId Session ID
   * @returns Array of evaluations
   */
  async getEvaluationsBySession(sessionId: string): Promise<Evaluation[]> {
    try {
      return await this.evaluationRepository.find({
        where: { sessionId },
        relations: ['testCase', 'testCase.subCategory', 'testCase.subCategory.category'],
      });
    } catch (error) {
      this.logger.error(`Failed to get evaluations by session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get evaluations by test case
   * @param testCaseId Test case ID
   * @returns Array of evaluations
   */
  async getEvaluationsByTestCase(testCaseId: string): Promise<Evaluation[]> {
    try {
      return await this.evaluationRepository.find({
        where: { testCaseId },
      });
    } catch (error) {
      this.logger.error(`Failed to get evaluations by test case: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get evaluation results aggregated by category and subcategory
   * @param sessionId Session ID
   * @returns Aggregated evaluation results
   */
  async getEvaluationResults(sessionId: string): Promise<any> {
    try {
      const evaluations = await this.evaluationRepository.find({
        where: { sessionId },
        relations: ['testCase', 'testCase.subCategory', 'testCase.subCategory.category'],
      });

      if (evaluations.length === 0) {
        return {
          overallScore: 0,
          totalTestCases: 0,
          categories: [],
        };
      }

      // Group evaluations by category and subcategory
      const groupedResults = this.groupEvaluationsByCategory(evaluations);

      // Calculate overall score
      const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
      const overallScore = totalScore / evaluations.length;

      return {
        overallScore,
        totalTestCases: evaluations.length,
        categories: Object.values(groupedResults),
      };
    } catch (error) {
      this.logger.error(`Failed to get evaluation results: ${error.message}`);
      throw error;
    }
  }

  /**
   * Group evaluations by category and subcategory
   * @param evaluations Array of evaluations
   * @returns Grouped evaluation results
   */
  private groupEvaluationsByCategory(evaluations: Evaluation[]): Record<string, any> {
    const grouped: Record<string, any> = {};

    for (const evaluation of evaluations) {
      const testCase = evaluation.testCase;
      if (!testCase || !testCase.subCategory || !testCase.subCategory.category) {
        continue;
      }

      const category = testCase.subCategory.category;
      const subCategory = testCase.subCategory;

      if (!grouped[category.id]) {
        grouped[category.id] = {
          id: category.id,
          name: category.name,
          score: 0,
          testCases: 0,
          subCategories: {},
        };
      }

      if (!grouped[category.id].subCategories[subCategory.id]) {
        grouped[category.id].subCategories[subCategory.id] = {
          id: subCategory.id,
          name: subCategory.name,
          score: 0,
          testCases: 0,
          evaluations: [],
        };
      }

      grouped[category.id].subCategories[subCategory.id].evaluations.push(evaluation);
      grouped[category.id].subCategories[subCategory.id].testCases += 1;
      grouped[category.id].testCases += 1;
    }

    // Calculate scores for subcategories and categories
    for (const categoryId in grouped) {
      let categoryTotalScore = 0;
      let categoryTotalTestCases = 0;

      for (const subCategoryId in grouped[categoryId].subCategories) {
        const subCategory = grouped[categoryId].subCategories[subCategoryId];
        const subCategoryTotalScore = subCategory.evaluations.reduce(
          (sum: number, evaluation: Evaluation) => sum + evaluation.score,
          0
        );
        
        subCategory.score = subCategoryTotalScore / subCategory.testCases;
        categoryTotalScore += subCategoryTotalScore;
        categoryTotalTestCases += subCategory.testCases;

        // Convert subcategory evaluations to array for easier client-side processing
        subCategory.evaluations = subCategory.evaluations.map((evaluation: Evaluation) => ({
          id: evaluation.id,
          testCaseId: evaluation.testCaseId,
          prompt: evaluation.testCase.prompt,
          score: evaluation.score,
          inHouseModelResponse: evaluation.inHouseModelResponse,
          baselineModelResponse: evaluation.baselineModelResponse,
          evaluationNotes: evaluation.evaluationNotes,
        }));
      }

      grouped[categoryId].score = categoryTotalScore / categoryTotalTestCases;
      
      // Convert subcategories object to array for easier client-side processing
      grouped[categoryId].subCategories = Object.values(grouped[categoryId].subCategories);
    }

    return grouped;
  }
} 