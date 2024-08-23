// src/groq-cloud/groq-cloud.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GroqCloudService {
  private readonly groqCloudUrl = 'https://api.groq.cloud/v1/chat/completion';
  private readonly apiKey = process.env.GROQ_API_KEY;

  async getChatResponse(prompt: string, chatHistory: string[]): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const data = {
      prompt: chatHistory.concat(prompt).join('\n'),
      max_tokens: 1024,
      temperature: 0.5,
    };

    try {
      const response = await axios.post(this.groqCloudUrl, data, { headers });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}