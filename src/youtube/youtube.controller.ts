import { Controller, Post, Body } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Post('download')
  async downloadAudio(
    @Body() body: { url: string },
  ): Promise<{ filePath: string }> {
    const { url } = body;
    const filePath = await this.youtubeService.downloadAudio(url);
    return { filePath };
  }
}
