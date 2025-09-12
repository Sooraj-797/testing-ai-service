import { Injectable, Logger } from '@nestjs/common';
import { EvaluationAgent } from '../../agents/evaluation.agent';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { CreateEvaluationTemplateDto } from './dto/create-evaluation-template.dto';
import * as XLSX from 'xlsx';
const NodeCache = require('node-cache');

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);
  private readonly templateCache: any;

  constructor(private readonly evaluationAgent: EvaluationAgent) {
    // Initialize cache with standard TTL of 1 hour and check period of 10 minutes
    this.templateCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
  }

  async evaluateConversations(createEvaluationDto: CreateEvaluationDto): Promise<any> {
    this.logger.log(`Processing evaluation request for session ${createEvaluationDto.sessionID}`);
    
    try {
      // Validate the input data
      if (!Array.isArray(createEvaluationDto.conversation) || createEvaluationDto.conversation.length === 0) {
        this.logger.warn('No conversation provided for evaluation');
        throw new Error('No conversation provided for evaluation');
      }
      
      // Process evaluation using the agent
      const result = await this.evaluationAgent.evaluateConversation({
        sessionID: createEvaluationDto.sessionID,
        personaID: createEvaluationDto.personaID,
        agent: createEvaluationDto.agent,
        conversation: createEvaluationDto.conversation,
        scenario: createEvaluationDto.scenario
      });
      
      this.logger.log(`Evaluation processed successfully for session ${createEvaluationDto.sessionID}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing evaluation: ${error.message}`);
      throw error;
    }
  }

  async uploadEvaluationTemplate(fileData: CreateEvaluationTemplateDto): Promise<any> {
    this.logger.log(`Uploading evaluation template for session ${fileData.sessionID}`);
    
    try {
      // Check if we have the necessary data
      if (!fileData.buffer && !fileData.file?.buffer) {
        throw new Error('No file data provided');
      }
      
      // Store the template data in cache with sessionID as key
      const cacheKey = `template_${fileData.sessionID}`;
      
      // Handle both direct file upload and base64 string
      let buffer = fileData.buffer;
      let originalname = fileData.originalname;
      let mimetype = fileData.mimetype;
      
      // If file object is provided, extract data from it
      if (fileData.file) {
        buffer = fileData.file.buffer.toString('base64');
        originalname = fileData.file.originalname;
        mimetype = fileData.file.mimetype;
      }
      
      const templateData = {
        buffer,
        originalname,
        mimetype,
        uploadedAt: new Date()
      };
      
      const success = this.templateCache.set(cacheKey, templateData);
      if (!success) {
        throw new Error('Failed to cache template data');
      }
      
      this.logger.log(`Template data cached successfully for session ${fileData.sessionID}`);
      return {
        success: true,
        sessionID: fileData.sessionID,
        filename: originalname,
        message: 'Evaluation template uploaded and cached successfully'
      };
    } catch (error) {
      this.logger.error(`Error caching template data: ${error.message}`);
      throw error;
    }
  }

  getEvaluationTemplate(sessionID: number): any {
    try {
      const cacheKey = `template_${sessionID}`;
      const templateData = this.templateCache.get(cacheKey);
      
      if (!templateData) {
        this.logger.warn(`No template found for session ${sessionID}`);
        return null;
      }

      // Convert base64 buffer back to Buffer
      const buffer = Buffer.from(templateData.buffer, 'base64');
      
      // Read the Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: ['traits', 'definition', 'level1', 'level2', 'level3', 'level4', 'level5'],
        range: 1  // Skip the first row (header)
      });

      // Log the extracted table data
      this.logger.log('=== Evaluation Template Data ===');
      this.logger.log(`Total rows found: ${jsonData.length}`);
      
      // Create a formatted table string
      const tableRows = jsonData.map((row: any, index: number) => {
        return `
Row ${index + 1}:
  Trait: ${row.traits}
  Definition: ${row.definition}
  Level 1: ${row.level1}
  Level 2: ${row.level2}
  Level 3: ${row.level3}
  Level 4: ${row.level4}
  Level 5: ${row.level5}
----------------------------------------`;
      });

      // Log each row in a formatted way
      tableRows.forEach((row: string) => {
        this.logger.log(row);
      });

      this.logger.log('=== End of Template Data ===');
      this.logger.log(`Successfully parsed template data for session ${sessionID}`);
      
      return {
        success: true,
        sessionID,
        filename: templateData.originalname,
        data: jsonData,
        originalTemplate: templateData
      };
    } catch (error) {
      this.logger.error(`Error parsing template data: ${error.message}`);
      throw error;
    }
  }
} 