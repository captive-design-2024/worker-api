import { Controller, Post, Body } from '@nestjs/common';
import { TtsService } from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly textToSpeechService: TtsService) {}

  @Post('test')
  async testTTS(@Body('text') text: string): Promise<string> {
    const path = '../../storage/dubbing';
    const index = 1;
    return this.textToSpeechService.textToSpeech(text, path, index);
  }

  @Post('generate-dub')
  async generatedub(@Body() data: any): Promise<string> {
    return this.textToSpeechService.generateDubParts(data);
  }

  @Post('create-dubbing')
  async createDubbing(
    @Body() body: { folderPath: string; jsonData: any },
  ): Promise<string> {
    const { folderPath, jsonData } = body;
    try {
      return this.textToSpeechService.createSequence(folderPath, jsonData);
    } catch (error) {
      console.error(error);
      throw new Error(`Error creating dubbing: ${error.message}`);
    }
  }
}
