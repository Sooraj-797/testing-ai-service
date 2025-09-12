import { Module } from '@nestjs/common';
import { EventEmitterModule as NestEventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    NestEventEmitterModule.forRoot({
      // Global event emitter options
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  exports: [NestEventEmitterModule],
})
export class EventEmitterModule {} 