import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { exec } from 'youtube-dl-exec';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class YoutubeService {
  async downloadAudio(url: string): Promise<string> {
    try {
      const uuid = uuidv4();
      const outputFilePath = path.resolve(
        __dirname,
        `../../downloads/${uuid}.mp3`,
      );

      const options = {
        extractAudio: true,
        audioFormat: 'mp3',
        output: outputFilePath,
        noCheckCertificate: true,
        noWarnings: true,
        quiet: true,
      };

      await exec(url, options);

      return outputFilePath;
    } catch (error) {
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }
}
