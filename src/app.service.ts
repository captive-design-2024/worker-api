import { Injectable } from '@nestjs/common';
import { YoutubeService } from './youtube/youtube.service';
import { SttService } from './stt/stt.service';
import { SrtService } from './srt/srt.service';
import { TtsService } from './tts/tts.service';
import { LjsService } from './ljs/ljs.service';
import * as path from 'path';

@Injectable()
export class AppService {
  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly sttService: SttService,
    private readonly srtService: SrtService,
    private readonly ttsService: TtsService,
    private readonly ljsService: LjsService,
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

  async generateVCDubbing(filePath: string): Promise<string> {
    try {
      const contents = await this.srtService.parseSRT(filePath);
      return this.ttsService.generateVCVoiceOver(contents);
    } catch (error) {
      console.error('Error generating dubbing:', error);
      throw new Error('dubbing generation from file failed');
    }
  }

  async generateLJSfromSRT(
    audioPath: string,
    srtPath: string,
  ): Promise<string> {
    try {
      const contents = await this.srtService.parseSRT(srtPath);
      return await this.ljsService.createLJSpeechDataset(audioPath, contents);
    } catch (error) {
      console.error('Error generating LJS:', error);
      throw new Error('LJS generation from file failed');
    }
  }

  async generateLJSfromLinks(links: string[]): Promise<string> {
    const datasetDir = [];
    for (const link of links) {
      try {
        const audioPath = await this.youtubeService.downloadAudio(link);
        const transcribeId = await this.sttService.transcribeFile(audioPath, 1);
        const utterances =
          await this.sttService.getTranscribeResult(transcribeId);
        const srtFilename = `${path.basename(audioPath, path.extname(audioPath))}.srt`;
        const srtFilePath = await this.srtService.generateSrtFile(
          utterances,
          srtFilename,
        );
        const contents = await this.srtService.parseSRT(srtFilePath);
        datasetDir.push(
          await this.ljsService.createLJSpeechDataset(audioPath, contents),
        );
        console.log('LJS dataset created:', datasetDir);
      } catch (error) {
        console.error('Error generating LJS:', error);
        throw new Error(error.message);
      }
    }
    return this.ljsService.MergeDatasets(datasetDir);
  }
}
