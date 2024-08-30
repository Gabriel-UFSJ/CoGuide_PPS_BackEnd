import { Injectable } from '@nestjs/common';
import GroqClient from 'groq-sdk';

@Injectable()
export class GroqCloudService {
  private readonly groqClient: GroqClient;

  constructor() {
    this.groqClient = new GroqClient({ apiKey: process.env.GROQ_API_KEY });
  }

  async getChatResponse(
    prompt: string,
    chatHistory: string[],
  ): Promise<string> {
    const messages: {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }[] = [
      ...chatHistory.map((message) => ({
        role: 'assistant' as const,
        content: message,
      })),
      { role: 'user' as const, content: prompt },
    ];

    const completion = await this.groqClient.chat.completions.create({
      messages,
      model: 'llama3-8b-8192',
      max_tokens: 1024,
      temperature: 0.5,
    });

    if (completion.choices.length > 0) {
      return completion.choices[0].message?.content || '';
    } else {
      return null;
    }
  }

  async generateTitle(prompt: string): Promise<string> {
    const messages: GroqClient.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: `Generate a concise and descriptive title for the following chat prompt: "${prompt}"`,
        name: 'title-generator',
      },
    ];

    try {
      const completion = await this.groqClient.chat.completions.create({
        messages,
        model: 'llama3-8b-8192',
        max_tokens: 20,
        temperature: 0.5,
      });

      return completion.choices.length > 0
        ? completion.choices[0].message.content.trim()
        : 'Untitled Chat';
    } catch (error) {
      console.error('Error occurred while generating title:', error.message);
      return 'Untitled Chat';
    }
  }
}
