import { Controller, Post, Body } from '@nestjs/common';
import { TtsService } from './tts.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tts')
@Controller('tts')
export class TtsController {
  constructor(private readonly textToSpeechService: TtsService) {}

  @Post('test')
  async testTTS(@Body('text') text: string): Promise<string> {
    const path = '../../storage/dubbing';
    const index = 1;
    return this.textToSpeechService.textToSpeech(text, path, index);
  }

  @Post('synthesize')
  async synthesizeVoice(@Body() body: { text: string }): Promise<string> {
    const { text } = body;
    const folderPath = '../../storage/dubbing';
    const index = 10;
    return this.textToSpeechService.VCTTS(text, folderPath, index);
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

  @Post('generate-vc-dub')
  async generateVcdub(@Body() data: any): Promise<string> {
    return this.textToSpeechService.generateVCDubParts(data);
  }

  @Post('create-vc-dubbing')
  async createVcDubbing(
    @Body() body: { folderPath: string; jsonData: any },
  ): Promise<string> {
    const { folderPath, jsonData } = body;
    try {
      return this.textToSpeechService.createVCSequence(folderPath, jsonData);
    } catch (error) {
      console.error(error);
      throw new Error(`Error creating dubbing: ${error.message}`);
    }
  }
}
