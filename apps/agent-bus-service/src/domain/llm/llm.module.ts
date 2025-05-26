import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LLMService } from './llm.service';
import { LLM_CONFIG } from './llm.config';

@Module({
  imports: [
    HttpModule.register({
      timeout: LLM_CONFIG.REQUEST_TIMEOUT,
      maxRedirects: 5,
    }),
  ],
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {} 