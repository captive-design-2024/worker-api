import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly messageService: LlmService) {}

  @Post()
  async sendMessage(@Body('projectId') id: string): Promise<string> {
    const response = await this.messageService.getSRT(id);
    return this.messageService.sendMessage(response + "수정할 부분 밑줄 쳐줘" )
  }
}
