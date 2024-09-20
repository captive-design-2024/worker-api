import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  private readonly clientId = process.env.CLIENT_ID;
  private readonly clientSecret = process.env.CLIENT_SECRET;

  async getAccessToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        'https://openapi.vito.ai/v1/authenticate',
        {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        },
      );

      return response.data.access_token;
    } catch (error) {
      console.error(
        'Error obtaining access token',
        error.response?.data || error.message,
      );
      return null;
    }
  }
}
