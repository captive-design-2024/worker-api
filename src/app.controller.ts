import { Controller, Post, Body, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generate-subtitle')
  async generateSubtitleFromYoutube(
    @Body('url') url: string,
    @Res() res: Response,
  ) {
    try {
      const srtFilePath =
        await this.appService.generateSubtitleFromYoutube(url);

      console.log('Generated SRT file:', srtFilePath);
      res.download(srtFilePath, path.basename(srtFilePath), (err) => {
        if (err) {
          console.error('Error downloading the file', err);
          res.status(500).send('Error downloading the file');
        }
      });
    } catch (error) {
      console.error('Error generating subtitle from YouTube', error);
      res.status(500).send('Error generating subtitle from YouTube');
    }
  }

  @Post('generate-dubbing')
  async generateDub(@Body('srtFilePath') srtFilePath: string): Promise<void> {
    return this.appService.generateDubbing(srtFilePath);
  }
}
