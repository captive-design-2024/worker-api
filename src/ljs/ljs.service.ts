import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as archiver from 'archiver';

@Injectable()
export class LjsService {
  async createLJSpeechDataset(audioPath: string, json: any) {
    const { filename, contents } = json;
    const basefilename = path.basename(filename, path.extname(filename));
    const outputDir = path.join(__dirname, '../../storage/ljs', basefilename);
    const wavsDir = path.join(outputDir, 'wavs');
    await fs.promises.mkdir(wavsDir, { recursive: true });

    const splitPromises = contents.map(async (content) => {
      const startTime = this.formatTime(content.start);
      const duration = this.calculateDuration(content.start, content.end);
      const newFilename = `${basefilename}_${content.index}.wav`;
      const basenewfilename = path.basename(
        newFilename,
        path.extname(newFilename),
      );
      const outputWavFile = path.join(wavsDir, newFilename);
      await this.splitAndConvertToWav(
        audioPath,
        startTime,
        duration,
        outputWavFile,
      );
      return `${basenewfilename}|${content.string}`;
    });
    const metadataLines = await Promise.all(splitPromises);
    await this.createMetadataFile(metadataLines, outputDir);
    return outputDir;
  }

  async splitAndConvertToWav(
    inputPath: string,
    startTime: string,
    duration: string,
    outputPath: string,
  ) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .duration(duration)
        .audioFrequency(22050)
        .audioChannels(1)
        .toFormat('wav')
        .output(outputPath)
        .on('end', () => {
          resolve(true);
        })
        .on('error', (err) => {
          console.error(`Error creating ${outputPath}:`, err);
          reject(err);
        })
        .run();
    });
  }

  async createMetadataFile(metadataLines: string[], outputDir: string) {
    const metadataFile = path.join(outputDir, 'metadata.csv');
    const formattedLines = metadataLines.map((line) =>
      line.replace(/,/g, '，'),
    );
    await fs.promises.writeFile(
      metadataFile,
      formattedLines.join('\n'),
      'utf8',
    );
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

  async MergeDatasets(datasets: string[]) {
    const uuid = uuidv4();
    const outputDir = path.join(__dirname, '../../storage/ljs/', uuid);
    const mergedWavsDir = path.join(outputDir, 'wavs');
    const mergedMetadataFile = path.join(outputDir, 'metadata.csv');

    await fs.promises.mkdir(mergedWavsDir, { recursive: true });
    const metadataLines = [];
    for (const datasetDir of datasets) {
      const wavsDir = path.join(datasetDir, 'wavs');
      const metadataFile = path.join(datasetDir, 'metadata.csv');
      const metadataContent = await fs.promises.readFile(metadataFile, 'utf8');
      const lines = metadataContent.trim().split('\n');
      metadataLines.push(...lines);
      const wavFiles = await fs.promises.readdir(wavsDir);
      for (const wavFile of wavFiles) {
        const wavPath = path.join(wavsDir, wavFile);
        const newWavPath = path.join(mergedWavsDir, wavFile);
        await fs.promises.copyFile(wavPath, newWavPath);
      }
    }
    await fs.promises.writeFile(
      mergedMetadataFile,
      metadataLines.join('\n'),
      'utf8',
    );
    const zipFilePath = path.join(__dirname, `../../storage/ljs/${uuid}.zip`);
    await this.zipDirectory(outputDir, zipFilePath);

    datasets.push(outputDir);
    //await this.deleteOriginalFolders(datasets);
    return zipFilePath;
  }

  async zipDirectory(sourceDir: string, outPath: string) {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(true));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  async deleteOriginalFolders(datasets: string[]) {
    for (const datasetDir of datasets) {
      await fs.promises.rm(datasetDir, { recursive: true, force: true });
    }
  }
}
