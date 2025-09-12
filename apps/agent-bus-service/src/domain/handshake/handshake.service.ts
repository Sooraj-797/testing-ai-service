import { Injectable, Logger } from '@nestjs/common';
import { HandshakeAgent } from '../../agents/handshake.agent';
import { CreateHandshakeDto } from './dto/create-handshake.dto';

@Injectable()
export class HandshakeService {
  private readonly logger = new Logger(HandshakeService.name);

  constructor(private readonly handshakeAgent: HandshakeAgent) {}

  async processHandshake(createHandshakeDto: CreateHandshakeDto): Promise<any> {
    this.logger.log(`Processing handshake request for session ${createHandshakeDto.sessionID}`);
    
    try {      
      // Process handshake using the agent
      const result = await this.handshakeAgent.processHandshake(createHandshakeDto);
      this.logger.log(`Handshake processed successfully for session ${createHandshakeDto.sessionID}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing handshake: ${error.message}`);
      throw error;
    }
  }
  
}
