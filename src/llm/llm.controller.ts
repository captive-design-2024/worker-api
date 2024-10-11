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
    return this.messageService.sendMessage(data + '위 자막은 STT를 활용해 유튜브 동영상의 음성을 자막으로 생성한 것입니다. STT가 자막을 생성할 때, 문맥상 영상에서의 원래 의미와는 다르게 생성된 것으로 유추되는 단어만을 수정해주세요. 단, 수정된 부분만 볼드체로 표시하고, 수정되지 않은 문장은 반드시 원래 문장 그대로 출력해주세요. 형식은 반드시 SRT로 해줘');
  }

  @Post('check')
  async check(@Body('content') content: string) {
    // console.log(content + '위는 오디오 추출로 만든 자막인데 문맥적으로 어색한 부분에 밑줄쳐줘')
    return this.messageService.sendMessage(content + '위 자막은 STT를 활용해 유튜브 동영상의 음성을 자막으로 생성한 것입니다. STT가 자막을 생성할 때, 문맥상 영상에서의 원래 의미와는 다르게 생성된 것으로 유추되는 단어만을 수정해주세요. 단, 수정된 부분만 볼드체로 표시하고, 수정되지 않은 문장은 반드시 원래 문장 그대로 출력해주세요. 형식은 반드시 SRT로 해줘');
  }

  @Post('recommend')
  async recommendTitle(@Body('content') content: string) {
    return this.messageService.sendMessage(content + '위는 오디오 추출로 만든 SRT파일이야. 내용을 바탕으로 제목과 해시태그 추천해줘. 형식은 JSON, 내용은 제목:답변, 해시태그1:답변, 해시태그2: 답변 이런식으로 해줘');
  }

  @Post('translate')
  async translate(@Body('content') content: string, @Body('language') language: string) {
    return this.messageService.sendMessage(content + '위는 오디오 추출로 만든 SRT파일이야. 내용을 ' + language + '로 번역해줘. 형식은 SRT파일을 유지해줘');
  }
}
