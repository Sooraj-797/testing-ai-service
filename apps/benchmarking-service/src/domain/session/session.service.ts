import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Create a new benchmark session
   * @param createSessionDto Session creation data
   * @returns Created session
   */
  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    try {
      const session = this.sessionRepository.create(createSessionDto);
      return await this.sessionRepository.save(session);
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a session by ID
   * @param id Session ID
   * @returns Session if found
   */
  async getSession(id: string): Promise<Session> {
    try {
      const session = await this.sessionRepository.findOne({ 
        where: { id },
        relations: ['testCases', 'evaluations'],
      });
      
      if (!session) {
        throw new Error(`Session with ID ${id} not found`);
      }
      
      return session;
    } catch (error) {
      this.logger.error(`Failed to get session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all sessions
   * @returns Array of sessions
   */
  async getSessions(): Promise<Session[]> {
    try {
      return await this.sessionRepository.find();
    } catch (error) {
      this.logger.error(`Failed to get sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param id Session ID
   * @returns Deletion result
   */
  async deleteSession(id: string): Promise<{ deleted: boolean }> {
    try {
      const result = await this.sessionRepository.delete(id);
      return { deleted: result.affected > 0 };
    } catch (error) {
      this.logger.error(`Failed to delete session: ${error.message}`);
      throw error;
    }
  }
} 