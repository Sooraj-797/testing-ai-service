import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { json } from 'express';

async function bootstrap() {
  const logger = new Logger('ApiGateway');
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Add validation pipe for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  
  // Increase JSON payload size limit for larger requests
  app.use(json({ limit: '10mb' }));
  
  // Add global prefix if needed
  // app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API Gateway is running on port ${port}`);
  logger.log(`API documentation available at http://localhost:${port}/api`);
}

bootstrap();
