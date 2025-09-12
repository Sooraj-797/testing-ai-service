import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../session/entities/session.entity';
import { TestCase } from '../test-case/entities/test-case.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { ModelService } from '../../services/model/model.service';
import { QdrantService } from '../../services/qdrant/qdrant.service';
import { CacheService } from '../../services/cache/cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface GroupedCategory {
  name: string;
  subCategories: Record<string, GroupedSubCategory>;
}

interface GroupedSubCategory {
  name: string;
  testCases: TestCase[];
}

@Injectable()
export class BenchmarkService {
  private readonly logger = new Logger(BenchmarkService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    private readonly modelService: ModelService,
    private readonly qdrantService: QdrantService,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Start a benchmark session
   * @param sessionId Session ID to run benchmark for
   * @param topK Number of chunks to retrieve from Qdrant
   */
  async startBenchmark(sessionId: string, topK: number = 3): Promise<void> {
    try {
      // Get session
      const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
      if (!session) {
        throw new Error(`Session with ID ${sessionId} not found`);
      }

      // Get all test cases for the session, grouped by subcategory
      const testCases = await this.testCaseRepository.find({
        where: { sessionId },
        relations: ['subCategory', 'subCategory.category'],
      });

      if (testCases.length === 0) {
        throw new Error(`No test cases found for session ${sessionId}`);
      }

      // Group test cases by category and subcategory
      const groupedTestCases = this.groupTestCasesByCategory(testCases);

      // Process each category
      for (const [categoryId, categoryData] of Object.entries(groupedTestCases)) {
        const typedCategoryData = categoryData as GroupedCategory;
        
        // Emit event that category processing has started
        this.eventEmitter.emit('benchmark.category.started', {
          sessionId,
          categoryId,
          categoryName: typedCategoryData.name,
        });

        // Process each subcategory in the category
        for (const [subCategoryId, subCategoryData] of Object.entries(typedCategoryData.subCategories)) {
          const typedSubCategoryData = subCategoryData as GroupedSubCategory;
          
          // Emit event that subcategory processing has started
          this.eventEmitter.emit('benchmark.subcategory.started', {
            sessionId,
            categoryId,
            subCategoryId,
            subCategoryName: typedSubCategoryData.name,
          });

          // Process each test case in the subcategory
          for (const testCase of typedSubCategoryData.testCases) {
            await this.processTestCase(testCase, session, topK);
          }

          // Calculate and emit subcategory results
          const subcategoryResults = await this.calculateSubcategoryResults(sessionId, subCategoryId);
          this.eventEmitter.emit('benchmark.subcategory.completed', {
            sessionId,
            categoryId,
            subCategoryId,
            subCategoryName: typedSubCategoryData.name,
            results: subcategoryResults,
          });
        }

        // Calculate and emit category results
        const categoryResults = await this.calculateCategoryResults(sessionId, categoryId);
        this.eventEmitter.emit('benchmark.category.completed', {
          sessionId,
          categoryId,
          categoryName: typedCategoryData.name,
          results: categoryResults,
        });
      }

      // Mark session as completed
      await this.sessionRepository.update(sessionId, { isCompleted: true });

      // Calculate and emit overall results
      const overallResults = await this.calculateOverallResults(sessionId);
      this.eventEmitter.emit('benchmark.session.completed', {
        sessionId,
        results: overallResults,
      });
    } catch (error) {
      this.logger.error(`Error running benchmark: ${error.message}`);
      this.eventEmitter.emit('benchmark.error', {
        sessionId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Process a single test case
   * @param testCase Test case to process
   * @param session Parent session
   * @param topK Number of chunks to retrieve
   */
  private async processTestCase(testCase: TestCase, session: Session, topK: number): Promise<void> {
    try {
      this.logger.log(`Processing test case ${testCase.id}`);
      
      // Emit event that test case processing has started
      this.eventEmitter.emit('benchmark.testcase.started', {
        sessionId: session.id,
        testCaseId: testCase.id,
        prompt: testCase.prompt,
      });

      // Step 1: Retrieve chunks from Qdrant
      let retrievedChunks = await this.cacheService.getChunks(testCase.id);
      
      if (!retrievedChunks) {
        retrievedChunks = await this.qdrantService.retrieveChunks(testCase.prompt, topK);
        
        // Store chunks in cache and in the test case
        await this.cacheService.storeChunks(testCase.id, retrievedChunks);
        await this.testCaseRepository.update(testCase.id, {
          retrievedChunks: JSON.stringify(retrievedChunks),
        });
      } else {
        this.logger.log(`Using cached chunks for test case ${testCase.id}`);
      }

      // Step 2: Get responses from both models
      const [inHouseResponse, baselineResponse] = await Promise.all([
        this.modelService.getInHouseModelResponse(testCase.prompt, retrievedChunks),
        this.modelService.getBaselineModelResponse(testCase.prompt),
      ]);

      // Step 3: Evaluate the responses
      const evaluation = await this.modelService.evaluateResponses(inHouseResponse, baselineResponse);

      // Step 4: Save the evaluation
      const evaluationEntity = this.evaluationRepository.create({
        sessionId: session.id,
        testCaseId: testCase.id,
        inHouseModelResponse: inHouseResponse,
        baselineModelResponse: baselineResponse,
        score: evaluation.score,
        evaluationNotes: evaluation.notes,
      });

      await this.evaluationRepository.save(evaluationEntity);

      // Emit event that test case processing has completed
      this.eventEmitter.emit('benchmark.testcase.completed', {
        sessionId: session.id,
        testCaseId: testCase.id,
        score: evaluation.score,
      });
    } catch (error) {
      this.logger.error(`Error processing test case ${testCase.id}: ${error.message}`);
      
      // Emit error event
      this.eventEmitter.emit('benchmark.testcase.error', {
        sessionId: session.id,
        testCaseId: testCase.id,
        error: error.message,
      });
      
      // Continue with the next test case
    }
  }

  /**
   * Group test cases by category and subcategory
   * @param testCases Array of test cases
   * @returns Grouped test cases
   */
  private groupTestCasesByCategory(testCases: TestCase[]): Record<string, GroupedCategory> {
    const grouped: Record<string, GroupedCategory> = {};

    for (const testCase of testCases) {
      const category = testCase.subCategory?.category;
      const subCategory = testCase.subCategory;

      if (!category || !subCategory) {
        continue;
      }

      if (!grouped[category.id]) {
        grouped[category.id] = {
          name: category.name,
          subCategories: {},
        };
      }

      if (!grouped[category.id].subCategories[subCategory.id]) {
        grouped[category.id].subCategories[subCategory.id] = {
          name: subCategory.name,
          testCases: [],
        };
      }

      grouped[category.id].subCategories[subCategory.id].testCases.push(testCase);
    }

    return grouped;
  }

  /**
   * Calculate results for a subcategory
   * @param sessionId Session ID
   * @param subCategoryId Subcategory ID
   * @returns Subcategory results
   */
  private async calculateSubcategoryResults(sessionId: string, subCategoryId: string): Promise<any> {
    const evaluations = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.testCase', 'testCase')
      .where('evaluation.sessionId = :sessionId', { sessionId })
      .andWhere('testCase.subCategoryId = :subCategoryId', { subCategoryId })
      .getMany();

    if (evaluations.length === 0) {
      return {
        averageScore: 0,
        totalTestCases: 0,
        completedTestCases: 0,
      };
    }

    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore = totalScore / evaluations.length;

    return {
      averageScore,
      totalTestCases: evaluations.length,
      completedTestCases: evaluations.length,
    };
  }

  /**
   * Calculate results for a category
   * @param sessionId Session ID
   * @param categoryId Category ID
   * @returns Category results
   */
  private async calculateCategoryResults(sessionId: string, categoryId: string): Promise<any> {
    const evaluations = await this.evaluationRepository
      .createQueryBuilder('evaluation')
      .innerJoin('evaluation.testCase', 'testCase')
      .innerJoin('testCase.subCategory', 'subCategory')
      .where('evaluation.sessionId = :sessionId', { sessionId })
      .andWhere('subCategory.categoryId = :categoryId', { categoryId })
      .getMany();

    if (evaluations.length === 0) {
      return {
        averageScore: 0,
        totalTestCases: 0,
        completedTestCases: 0,
      };
    }

    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore = totalScore / evaluations.length;

    return {
      averageScore,
      totalTestCases: evaluations.length,
      completedTestCases: evaluations.length,
    };
  }

  /**
   * Calculate overall results for a session
   * @param sessionId Session ID
   * @returns Overall results
   */
  private async calculateOverallResults(sessionId: string): Promise<any> {
    const evaluations = await this.evaluationRepository
      .find({ where: { sessionId } });

    if (evaluations.length === 0) {
      return {
        averageScore: 0,
        totalTestCases: 0,
        completedTestCases: 0,
      };
    }

    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore = totalScore / evaluations.length;

    return {
      averageScore,
      totalTestCases: evaluations.length,
      completedTestCases: evaluations.length,
    };
  }
} 