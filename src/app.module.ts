import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YoutubeModule } from './youtube/youtube.module';
import { SttModule } from './stt/stt.module';
import { LlmModule } from './llm/llm.module';
import { TtsModule } from './tts/tts.module';
import { SrtModule } from './srt/srt.module';
import { FilesModule } from './files/files.module';
import { LjsModule } from './ljs/ljs.module';

@Module({
  imports: [
    YoutubeModule,
    SttModule,
    LlmModule,
    TtsModule,
    SrtModule,
    FilesModule,
    LjsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
