import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';

dotenv.config();

@Injectable()
export class TtsService {
  private readonly ttsApiUrl: string;
  private readonly apiKey: string;
  private readonly outputDir: string;
  private readonly finalOutputFile: string;

  constructor() {
    this.ttsApiUrl = 'https://api.openai.com/v1/audio/speech';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.outputDir = path.resolve(__dirname, '../../dub');
    this.finalOutputFile = path.join(this.outputDir, 'final_output.mp3');
  }

  async generateVoiceOver(srtFilePath: string): Promise<void> {
    const srtContent = await fs.promises.readFile(srtFilePath, 'utf-8');
    const subtitleLines = this.parseSrt(srtContent);

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    await Promise.all(
      subtitleLines.map(async (line) => {
        try {
          const response = await axios.post(
            this.ttsApiUrl,
            {
              model: 'tts-1',
              voice: 'alloy',
              input: line.text,
            },
            {
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
              },
              responseType: 'arraybuffer',
            },
          );

          const buffer = Buffer.from(response.data);
          const audioFilePath = path.join(this.outputDir, `${line.index}.mp3`);
          await fs.promises.writeFile(audioFilePath, buffer);
        } catch (error) {
          console.error(
            `Error generating speech for subtitle index ${line.index}`,
            error,
          );
          throw new Error(
            `Failed to generate speech for subtitle index ${line.index}`,
          );
        }
      }),
    );

    await this.concatenateAudioWithSilence(subtitleLines);
  }

  private parseSrt(
    srtContent: string,
  ): { index: number; text: string; startTime: number; endTime: number }[] {
    const lines = srtContent
      .split('\n')
      .filter((line) => line.trim().length > 0);
    const subtitles: {
      index: number;
      text: string;
      startTime: number;
      endTime: number;
    }[] = [];
    let index = 0;

    for (let i = 0; i < lines.length; i++) {
      if (!isNaN(Number(lines[i]))) {
        index = Number(lines[i]);
        const [startTimeStr, endTimeStr] = lines[i + 1].split(' --> ');
        const text = lines[i + 2];

        const startTime = this.srtTimeToSeconds(startTimeStr);
        const endTime = this.srtTimeToSeconds(endTimeStr);

        if (text) {
          subtitles.push({ index, text, startTime, endTime });
        }
        i += 2;
      }
    }

    return subtitles;
  }

  private srtTimeToSeconds(timeStr: string): number {
    const [hours, minutes, seconds] = timeStr.split(':');
    const [sec, ms] = seconds.split(',');
    return +hours * 3600 + +minutes * 60 + +sec + +ms / 1000;
  }

  private async concatenateAudioWithSilence(
    subtitleLines: {
      index: number;
      text: string;
      startTime: number;
      endTime: number;
    }[],
  ): Promise<void> {
    const segments: string[] = [];
    let previousEndTime = 0;

    for (const line of subtitleLines) {
      const silenceDuration = line.startTime - previousEndTime;
      if (silenceDuration > 0) {
        const silenceFilePath = path.join(
          this.outputDir,
          `silence_${line.index}.mp3`,
        );
        await this.generateSilence(silenceFilePath, silenceDuration);
        segments.push(silenceFilePath);
      }

      const audioFilePath = path.join(this.outputDir, `${line.index}.mp3`);
      segments.push(audioFilePath);
      previousEndTime = line.endTime;
    }

    return new Promise((resolve, reject) => {
      const ffmpegCmd = ffmpeg();
      segments.forEach((segment) => {
        ffmpegCmd.input(segment);
      });

      ffmpegCmd
        .audioCodec('libmp3lame')
        .on('end', () => {
          console.log('Concatenation finished!');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error during concatenation', err);
          reject(err);
        })
        .mergeToFile(this.finalOutputFile);
    });
  }

  private generateSilence(filePath: string, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input('anullsrc=r=44100:cl=stereo')
        .inputFormat('lavfi')
        .audioCodec('libmp3lame')
        .duration(duration)
        .on('end', () => {
          console.log(`Silence generated: ${filePath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error generating silence: ${err.message}`);
          reject(err);
        })
        .save(filePath);
    });
  }
}
