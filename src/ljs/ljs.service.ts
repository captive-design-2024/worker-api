import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LjsService {
  async splitAudioBySubtitles(audioPath: string, json: any) {
    const { filename, contents } = json;
    const outputDir = path.join(
      __dirname,
      '../../storage/ljs',
      path.parse(filename).name,
    );
    await fs.promises.mkdir(outputDir, { recursive: true });

    const splitPromises = contents.map(async (content) => {
      const startTime = this.formatTime(content.start);
      const duration = this.calculateDuration(content.start, content.end);
      const outputFilename = path.join(
        outputDir,
        `segment_${content.index}.mp3`,
      );

      return new Promise((resolve, reject) => {
        ffmpeg(audioPath)
          .setStartTime(startTime)
          .duration(duration)
          .output(outputFilename)
          .on('end', () => {
            resolve(true);
          })
          .on('error', (err) => {
            console.error(
              `Error splitting audio for segment ${content.index}:`,
              err,
            );
            reject(err);
          })
          .run();
      });
    });

    await Promise.all(splitPromises);
    return outputDir;
  }

  formatTime(time: string): string {
    return time.replace(',', '.');
  }

  calculateDuration(start: string, end: string): string {
    const startTime = this.parseTime(start);
    const endTime = this.parseTime(end);
    const durationMs = endTime - startTime;
    const seconds = (durationMs / 1000).toFixed(3);
    return `${seconds}`;
  }

  parseTime(time: string): number {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, ms] = seconds.split(',');
    return (
      parseInt(hours, 10) * 3600000 +
      parseInt(minutes, 10) * 60000 +
      parseInt(secs, 10) * 1000 +
      parseInt(ms, 10)
    );
  }
}
