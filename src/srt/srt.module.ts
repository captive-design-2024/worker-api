import { Module } from '@nestjs/common';
import { SrtService } from './srt.service';
import { SrtController } from './srt.controller';

@Module({
  providers: [SrtService],
  controllers: [SrtController],
  exports: [SrtService],
})
export class SrtModule {}
