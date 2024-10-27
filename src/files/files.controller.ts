import { Controller, Post, Body, Res, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('download')
  async downloadFile(@Body('path') path: string, @Res() res: Response) {
    try {
      await this.filesService.downloadFile(path, res);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('readSrt')
  async readSRT(@Body('path') path: string): Promise<string> {
    try {
      const data = await this.filesService.readSRT(path);
      return data;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('updateSrt')
  async updateSRT(
    @Body('path') path: string,
    @Body('content') content: string,
  ) {
    return await this.filesService.updateSRT(path, content);
  }

  @Post('mp3')
  async getMP3(@Body('filePath') path: string, @Res() res: Response) {
    const filePath = await this.filesService.getMP3(path);

    const fileStream = createReadStream(filePath);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${filePath.split('\\').pop()}"`,
    });
    fileStream.pipe(res);
  }
}
