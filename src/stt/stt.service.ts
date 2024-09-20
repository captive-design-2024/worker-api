import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

@Injectable()
export class SttService {
  constructor(private authService: AuthService) {}

  async transcribeFile(filePath: string, spkCount: number): Promise<string> {
    const accessToken = await this.authService.getAccessToken();
    const apiBase = 'https://openapi.vito.ai';

    const config = {
      use_diarization: true,
      diarization: { spk_count: spkCount },
      use_multi_channel: false,
      use_itn: true,
      use_disfluency_filter: true,
      use_profanity_filter: false,
      use_paragraph_splitter: true,
      paragraph_splitter: { max: 50 },
      use_word_timestamp: true,
    };

    const form = new FormData();
    form.append('config', JSON.stringify(config));
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${apiBase}/v1/transcribe`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `bearer ${accessToken}`,
      },
    });

    return response.data.id;
  }

  async getTranscribeResult(transcribeId: string): Promise<string[]> {
    const accessToken = await this.authService.getAccessToken();
    const apiBase = 'https://openapi.vito.ai';

    return new Promise((resolve, reject) => {
      const poll = setInterval(async () => {
        const response = await axios.get(
          `${apiBase}/v1/transcribe/${transcribeId}`,
          {
            headers: {
              Authorization: `bearer ${accessToken}`,
            },
          },
        );

        const status = response.data.status;
        if (status === 'completed') {
          clearInterval(poll);
          const utterances = response.data.results.utterances;
          resolve(utterances);
        } else if (status === 'failed') {
          clearInterval(poll);
          reject('Transcription failed');
        }
      }, 5000);
    });
  }
}
