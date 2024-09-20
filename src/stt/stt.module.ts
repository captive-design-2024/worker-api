import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SttController } from './stt.controller';
import { SttService } from './stt.service';

@Module({
  controllers: [SttController],
  providers: [SttService, AuthService],
  exports: [SttService],
})
export class SttModule {}
