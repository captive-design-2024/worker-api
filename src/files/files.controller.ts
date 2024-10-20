import { Controller, Post, Body, Res, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { Response } from 'express';

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
}
