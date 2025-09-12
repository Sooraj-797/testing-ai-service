import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BenchmarkService } from './benchmark.service';
import { StartBenchmarkDto } from './dto/start-benchmark.dto';

@Controller()
export class BenchmarkController {
  constructor(private readonly benchmarkService: BenchmarkService) {}

  @MessagePattern('start_benchmark')
  async startBenchmark(@Payload() startBenchmarkDto: StartBenchmarkDto) {
    return this.benchmarkService.startBenchmark(
      startBenchmarkDto.sessionId,
      startBenchmarkDto.topK
    );
  }
} 