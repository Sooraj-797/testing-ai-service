import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AgentBusService');
  
  const host = process.env.AGENT_BUS_HOST || '0.0.0.0';
  const port = process.env.AGENT_BUS_PORT ? parseInt(process.env.AGENT_BUS_PORT, 10) : 3001;
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );
  
  await app.listen();
  logger.log(`Agent Bus Service is listening on TCP ${host}:${port}`);
}

bootstrap();
