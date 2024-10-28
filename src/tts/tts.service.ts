import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TtsService {
  private readonly ttsApiUrl: string;
  private readonly apiKey: string;
  private readonly vcttsurl: string;

  constructor() {
    this.ttsApiUrl = 'https://api.openai.com/v1/audio/speech';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.vcttsurl = 'http://host.docker.internal:4500/';
  }

  async textToSpeech(
    text: string,
    folderPath: string,
    index: number,
  ): Promise<string> {
    const speechFile = path.resolve(__dirname, folderPath, `${index}.mp3`);

    try {
      const response = await axios.post(
        this.ttsApiUrl,
        {
          model: 'tts-1',
          voice: 'alloy',
          input: text,
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
      await fs.promises.writeFile(speechFile, buffer);

      return speechFile;
    } catch (error) {
      console.error('Error generating speech from text', error);
      throw new Error('Failed to generate speech from text');
    }
  }

  async VCTTS(
    text: string,
    folderPath: string,
    index: number,
  ): Promise<string> {
    const speechFile = path.resolve(__dirname, folderPath, `${index}.wav`);
    const router = 'synthesize';

    try {
      const response = await axios.post(
        this.vcttsurl + router,
        {
          voice: 'a',
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          responseType: 'arraybuffer',
        },
      );

      const buffer = Buffer.from(response.data);
      await fs.promises.writeFile(speechFile, buffer);

      return speechFile;
    } catch (error) {
      console.error('Error generating speech from vctts', error);
      throw new Error('Failed to generate speech from vctts');
    }
  }

  async generateDubParts(data: any): Promise<string> {
    const { filename, contents } = data;
    const folderPath = path.resolve(
      __dirname,
      '../../storage/dubbing',
      path.parse(filename).name,
    );
    await fs.promises.mkdir(folderPath, { recursive: true });

    for (const content of contents) {
      const { index, string } = content;
      await this.textToSpeech(string, folderPath, index);
    }

    return folderPath;
  }

  async generateVCDubParts(data: any): Promise<string> {
    const { filename, contents } = data;
    const folderPath = path.resolve(
      __dirname,
      '../../storage/VCdubbing',
      path.parse(filename).name,
    );
    await fs.promises.mkdir(folderPath, { recursive: true });

    for (const content of contents) {
      const { index, string } = content;
      await this.VCTTS(string, folderPath, index);
    }

    return folderPath;
  }

  async createSequence(folderPath: string, jsonData: any): Promise<string> {
    const audioInputs: string[] = [];
    const delays: string[] = [];
    const outputPath = path.resolve(folderPath, 'dubbing.wav');

    jsonData.contents.forEach((content) => {
      const audioFilePath = path.resolve(folderPath, `${content.index}.mp3`);
      audioInputs.push(audioFilePath);

      const [hours, minutes, secondsMs] = content.start.split(':');
      const [seconds, milliseconds] = secondsMs.split(',');
      const totalMilliseconds =
        (+hours * 3600 + +minutes * 60 + +seconds) * 1000 + +milliseconds;
      delays.push(totalMilliseconds.toString());
    });

    return new Promise((resolve, reject) => {
      const delayFilters = audioInputs
        .map(
          (_, index) =>
            `[${index}]adelay=${delays[index]}|${delays[index]}[a${index + 1}]`,
        )
        .join('; ');
      const amixInputs = audioInputs
        .map((_, index) => `[a${index + 1}]`)
        .join('');
      const amixFilter = `${amixInputs}amix=inputs=${audioInputs.length}`;
      const filter = `${delayFilters}; ${amixFilter}`;
      const ffmpegCommand = ffmpeg();

      audioInputs.forEach((audioInput) => {
        ffmpegCommand.input(audioInput);
      });

      ffmpegCommand
        .complexFilter(filter)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        })
        .toFormat('wav')
        .save(outputPath);
    });
  }

  async createVCSequence(folderPath: string, jsonData: any): Promise<string> {
    const audioInputs: string[] = [];
    const delays: string[] = [];
    const outputPath = path.resolve(folderPath, 'dubbing.wav');

    jsonData.contents.forEach((content) => {
      const audioFilePath = path.resolve(folderPath, `${content.index}.wav`);
      audioInputs.push(audioFilePath);

      const [hours, minutes, secondsMs] = content.start.split(':');
      const [seconds, milliseconds] = secondsMs.split(',');
      const totalMilliseconds =
        (+hours * 3600 + +minutes * 60 + +seconds) * 1000 + +milliseconds;
      delays.push(totalMilliseconds.toString());
    });

    return new Promise((resolve, reject) => {
      const delayFilters = audioInputs
        .map(
          (_, index) =>
            `[${index}]adelay=${delays[index]}|${delays[index]}[a${index + 1}]`,
        )
        .join('; ');
      const amixInputs = audioInputs
        .map((_, index) => `[a${index + 1}]`)
        .join('');
      const amixFilter = `${amixInputs}amix=inputs=${audioInputs.length}`;
      const filter = `${delayFilters}; ${amixFilter}`;
      const ffmpegCommand = ffmpeg();

      audioInputs.forEach((audioInput) => {
        ffmpegCommand.input(audioInput);
      });

      ffmpegCommand
        .complexFilter(filter)
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(err);
        })
        .toFormat('wav')
        .save(outputPath);
    });
  }

  async generateVoiceOver(contents: any): Promise<string> {
    const folderPath = await this.generateDubParts(contents);
    return this.createSequence(folderPath, contents);
  }

  async generateVCVoiceOver(contents: any): Promise<string> {
    const folderPath = await this.generateVCDubParts(contents);
    return this.createVCSequence(folderPath, contents);
  }
}
