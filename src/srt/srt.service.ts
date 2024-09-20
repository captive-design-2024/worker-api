import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SrtService {
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
    const filePath = path.join(__dirname, '../../srt', filename);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, srtContent, 'utf8');
    return filePath;
  }
}
