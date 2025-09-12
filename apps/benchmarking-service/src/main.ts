import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "@nestjs/common";

async function bootstrap() {
    const logger = new Logger('BenchmarkingService');
    
    const host = process.env.AGENT_BUS_HOST || '0.0.0.0';
    const port = process.env.AGENT_BUS_PORT ? parseInt(process.env.AGENT_BUS_PORT, 10) : 3005;
    
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
    logger.log(`Benchmarking Service is listening on TCP ${host}:${port}`);
  }
  
  bootstrap();