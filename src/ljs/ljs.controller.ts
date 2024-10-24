import { Controller, Post, Body } from '@nestjs/common';
import { LjsService } from './ljs.service';

@Controller('Ljs')
export class LjsController {
  constructor(private readonly ljsService: LjsService) {}

  @Post('createLJS')
  async splitAudio(@Body() data: { audioPath: string; subtitles: any }) {
    const { audioPath, subtitles } = data;
    return await this.ljsService.createLJSpeechDataset(audioPath, subtitles);
  }

  @Post('mergeLJS')
  async mergeDataset(@Body('folderPaths') folderPaths: string[]) {
    return await this.ljsService.MergeDatasets(folderPaths);
  }
}
