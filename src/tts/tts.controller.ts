import { Controller, Post, Body } from '@nestjs/common';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('generate')
  async generateSpeech(
    @Body('srtFilePath') srtFilePath: string,
  ): Promise<void> {
    return this.ttsService.generateVoiceOver(srtFilePath);
  }
}
