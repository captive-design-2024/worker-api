import { Injectable } from '@nestjs/common';
import { YoutubeService } from './youtube/youtube.service';
import { SttService } from './stt/stt.service';
import { SrtService } from './srt/srt.service';
import { TtsService } from './tts/tts.service';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly sttService: SttService,
    private readonly srtService: SrtService,
    private readonly ttsService: TtsService,
  ) {}

  async generateSubtitleFromYoutube(url: string): Promise<string> {
    try {
      const filePath = await this.youtubeService.downloadAudio(url);
      const transcribeId = await this.sttService.transcribeFile(filePath, 1);
      const utterances =
        await this.sttService.getTranscribeResult(transcribeId);
      const srtFilename = `${path.basename(filePath, path.extname(filePath))}.srt`;
      const srtFilePath = await this.srtService.generateSrtFile(
        utterances,
        srtFilename,
      );
      return srtFilePath;
    } catch (error) {
      console.error('Error generating subtitle:', error);
      throw new Error('Subtitle generation from YouTube failed');
    }
  }

  async generateDubbing(filePath: string): Promise<string> {
    try {
      const contents = await this.srtService.parseSRT(filePath);
      return this.ttsService.generateVoiceOver(contents);
    } catch (error) {
      console.error('Error generating dubbing:', error);
      throw new Error('dubbing generation from file failed');
    }
  }
}
