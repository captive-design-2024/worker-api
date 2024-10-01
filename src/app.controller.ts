import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-subtitle')
  async generateSubtitleFromYoutube(@Body('url') url: string): Promise<string> {
    try {
      const srtFilePath =
        await this.appService.generateSubtitleFromYoutube(url);
      return srtFilePath;
    } catch (error) {
      console.error('Error generating subtitle from YouTube', error);
      throw new Error('Error generating subtitle from YouTube');
    }
  }

  @Post('generate-dubbing')
  async generateDub(@Body('srtFilePath') srtFilePath: string): Promise<void> {
    return this.appService.generateDubbing(srtFilePath);
  }
}
