import { Controller, Post, Body, Res } from '@nestjs/common';
import { SrtService } from './srt.service';
import { Response } from 'express';

@Controller('srt')
export class SrtController {
  constructor(private readonly srtService: SrtService) {}

  @Post('generate')
  async generateSrt(@Body() jsonData: any, @Res() res: Response) {
    const srtContent = this.srtService.convertJsonToSrt(jsonData);
    const filename = 'output.srt';
    const filePath = await this.srtService.saveSrtToFile(srtContent, filename);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading the file', err);
        res.status(500).send('Error downloading the file');
      }
    });
  }
}
