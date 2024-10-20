import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SrtService {
  async generateSrtFile(jsonData: any, filename: string): Promise<string> {
    const srtContent = this.convertJsonToSrt(jsonData);
    const filePath = await this.saveSrtToFile(srtContent, filename);
    return filePath;
  }

  convertJsonToSrt(jsonData: any): string {
    let srtContent = '';
    jsonData.forEach((utterance, index) => {
      const startTime = this.msToTime(utterance.start_at);
      const endTime = this.msToTime(utterance.start_at + utterance.duration);
      const text = utterance.msg;

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${text}\n\n`;
    });
    return srtContent;
  }

  msToTime(duration: number): string {
    const milliseconds = parseInt((duration % 1000).toString(), 10);
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const hoursStr = hours < 10 ? `0${hours}` : hours;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    const millisecondsStr =
      milliseconds < 100 ? `0${milliseconds}` : milliseconds;

    return `${hoursStr}:${minutesStr}:${secondsStr},${millisecondsStr}`;
  }

  async saveSrtToFile(srtContent: string, filename: string): Promise<string> {
    const filePath = path.join(__dirname, '../../storage/srt', filename);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, srtContent, 'utf8');
    return filePath;
  }

  async parseSRT(
    filePath: string,
  ): Promise<{ filename: string; contents: any[] }> {
    const content = await this.readFile(filePath);
    const strings = this.extractSubtitles(content);
    const filename = path.basename(filePath);
    return { filename: filename, contents: strings };
  }

  private async readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }

  private extractSubtitles(srtContent: string): any[] {
    const lines = srtContent.split('\n');
    const subtitles = [];

    for (let i = 0; i < lines.length; i++) {
      if (!isNaN(parseInt(lines[i]))) {
        const index = parseInt(lines[i]);
        const [start, end] = lines[i + 1].split(' --> ');
        const string = lines[i + 2];

        subtitles.push({
          index: index,
          start: start,
          end: end,
          string: string,
          len: string.length,
        });

        i += 2;
      }
    }
    return subtitles;
  }
}
