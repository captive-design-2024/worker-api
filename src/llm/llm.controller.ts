import { Controller, Post, Body } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly messageService: LlmService) {}

  @Post()
  async sendMessage(@Body('content_projectID') id: string): Promise<string> {
    const filepath = await this.messageService.getSRTpath(id);
    const resolvedPath = path.resolve('srt/' + filepath + '.srt');
    const data = await fs.readFile(resolvedPath, 'utf-8');
    return this.messageService.sendMessage(data + '프롬프팅');
  }
}
