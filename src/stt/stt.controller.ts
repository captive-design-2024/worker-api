import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SttService } from './stt.service';
import { Response } from 'express';
import * as multer from 'multer';

@Controller('stt')
export class SttController {
  constructor(private sttService: SttService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file', { storage: multer.diskStorage({}) }))
  async transcribeFile(
    @UploadedFile() file,
    @Res() res: Response,
    @Body('spk_count') spkCount: string = '1',
  ) {
    const spkCountNumber = parseInt(spkCount, 10);
    try {
      const transcribeId = await this.sttService.transcribeFile(
        file.path,
        spkCountNumber,
      );
      const result = await this.sttService.getTranscribeResult(transcribeId);
      res.json(result);
    } catch (error) {
      console.error('Error', error);
      res.status(500).send('Return Zero API Error');
    }
  }
}
