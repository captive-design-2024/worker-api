import { Module } from '@nestjs/common';
import { LjsService } from './ljs.service';
import { LjsController } from './ljs.controller';

@Module({
  providers: [LjsService],
  controllers: [LjsController],
  exports: [LjsService],
})
export class LjsModule {}
