import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly messageService: LlmService) {}

  @Post()
  async sendMessage(@Body('prompt') prompt: string): Promise<string> {
    return this.messageService.sendMessage(prompt);
  }
}
