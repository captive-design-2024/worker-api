import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

@Injectable()
export class LlmService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async sendMessage(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 850,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const completion = response.data.choices[0].message.content.trim();
      return completion;
    } catch (error) {
      console.error('Error communicating with OpenAI API', error);
      throw new Error('Failed to communicate with OpenAI API');
    }
  }

  async generatenewSrt(
    prompt: string,
    language: string,
    filename: string,
  ): Promise<string> {
    try {
      const responseText = await this.sendMessage(prompt);
      const baseFilename = path.basename(filename);
      // console.log("base: ",baseFilename)
      // console.log("lang : ",language)
      const outputDir = path.join(
        __dirname,
        `../../storage/translatedsrt/${language}_${baseFilename}`,
      );
      await fs.promises.mkdir(path.dirname(outputDir), { recursive: true });
      // console.log("outputdir: ",outputDir)
      await fs.promises.writeFile(outputDir, responseText, 'utf8');
      return outputDir;
    } catch (error) {
      console.error('Failed to save SRT file', error);
      throw new Error('Failed to save SRT file');
    }
  }
}
