import { Controller, Post, Body, Logger, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateHandshakeDto } from 'apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto';
import { firstValueFrom } from 'rxjs';

@Controller('handshake')
export class HandshakeController {
  private readonly logger = new Logger(HandshakeController.name);

  constructor(
    @Inject('AGENT_BUS_SERVICE') private readonly handshakeService: ClientProxy) {}

  @Post('conversation')
  async conductConversation(@Body() createHandshakeDto: CreateHandshakeDto): Promise<any> {
    this.logger.log(`Received handshake request for session ${createHandshakeDto.sessionID}`);
    const result = await firstValueFrom(
        this.handshakeService.send('processHandshake', createHandshakeDto));
    return result;
  }
}
