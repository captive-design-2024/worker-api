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
  async generateDub(@Body('srtFilePath') srtFilePath: string): Promise<string> {
    return await this.appService.generateDubbing(srtFilePath);
  }

  @Post('generate-vc-dubbing')
  async generateVcDub(
    @Body('srtFilePath') srtFilePath: string,
  ): Promise<string> {
    return await this.appService.generateVCDubbing(srtFilePath);
  }

  @Post('generate-ljs')
  async generateLJS(
    @Body('audioPath') audioPath: string,
    @Body('srtPath') srtPath: string,
  ): Promise<string> {
    return await this.appService.generateLJSfromSRT(audioPath, srtPath);
  }

  @Post('generate-ljs-links')
  async generateLJSfromLinks(@Body('links') links: string[]): Promise<string> {
    return await this.appService.generateLJSfromLinks(links);
  }
}
