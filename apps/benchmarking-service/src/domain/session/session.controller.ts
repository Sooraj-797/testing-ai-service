import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionService } from './session.service';

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @MessagePattern('create_session')
  async createSession(@Payload() createSessionDto: CreateSessionDto) {
    return this.sessionService.createSession(createSessionDto);
  }

  @MessagePattern('get_session')
  async getSession(@Payload() id: string) {
    return this.sessionService.getSession(id);
  }

  @MessagePattern('get_sessions')
  async getSessions() {
    return this.sessionService.getSessions();
  }

  @MessagePattern('delete_session')
  async deleteSession(@Payload() id: string) {
    return this.sessionService.deleteSession(id);
  }
} 