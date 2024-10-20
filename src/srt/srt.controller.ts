import { Controller, Post, Body } from '@nestjs/common';
import { SrtService } from './srt.service';

@Controller('srt')
export class SrtController {
  constructor(private readonly srtService: SrtService) {}

  @Post('generate')
  async generateSrt(@Body() jsonData: any): Promise<{ filePath: string }> {
    const filename = 'output.srt';
    try {
      const filePath = await this.srtService.generateSrtFile(
        jsonData,
        filename,
      );
      return { filePath };
    } catch (error) {
      console.error('Error generating SRT file', error);
      throw new Error('Error generating SRT file');
    }
  }

  @Post('parse')
  async parseSrt(
    @Body() body: { filePath: string },
  ): Promise<{ contents: any[] }> {
    try {
      const { filePath } = body;
      const result = await this.srtService.parseSRT(filePath);
      return result;
    } catch (error) {
      console.error('Error parsing SRT file', error);
      throw new Error('Error parsing SRT file');
    }
  }
}
