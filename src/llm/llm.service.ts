import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

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
          max_tokens: 150,
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

  async getSRT(id: string): Promise<string> {
    return await axios.post(
      'http://localhost:3000/files/readSRT',
      {content_projectID: id, content_language: 'kr'}
    )
  }
}
