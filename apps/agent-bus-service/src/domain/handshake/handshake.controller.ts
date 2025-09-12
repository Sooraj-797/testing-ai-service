import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HandshakeService } from './handshake.service';
import { CreateHandshakeDto } from './dto/create-handshake.dto';

@Controller()
export class HandshakeController {
  constructor(private readonly handshakeService: HandshakeService) {}

  @MessagePattern('processHandshake')
  async processHandshake(@Payload() createHandshakeDto: CreateHandshakeDto): Promise<any> {
    return this.handshakeService.processHandshake(createHandshakeDto);
  }
}
