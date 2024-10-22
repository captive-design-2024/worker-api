import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  async downloadFile(path: string, res: Response): Promise<void> {
    try {
      const filePath = path;
      await fs.access(filePath);
      res.download(filePath, (err) => {
        if (err) {
          console.error('File download error:', err);
          res.status(500).send('Error downloading the file');
        }
      });
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  async readSRT(path: string): Promise<string> {
    try {
      const filePath = path;
      await fs.access(filePath);
      const data = await fs.readFile(filePath, 'utf8');
      return data;
    } catch (error) {
      console.error('Error in worker-readSRT:', error);
      throw new NotFoundException('File not found');
    }
  }

  async updateSRT(path: string, content: string) {
    try {
      await fs.writeFile(path, content, 'utf-8');
      return 'success';
    } catch (err) {
      throw new Error('Failed to update the file');
    }
  }

  async getMP3(path: string) {
    const normalizedPath = join(path);

    // Check if the file exists
    if (!existsSync(normalizedPath)) {
      throw new NotFoundException('MP3 file not found');
    }

    return normalizedPath;
  }
}
