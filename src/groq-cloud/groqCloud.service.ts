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

  async getSystemMessage(): Promise<string> {
    try {
      const response = await fetch('http://python_backend:8000/get_context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'eSocial' }),
      });
      const systemMessage = await response.json();

      const systemPrompt = `
      You are a technical assistant responsible for answering questions about the eSocial processes of the Brazilian federal government. Your main objective is to serve as an additional channel for responding to inquiries within a company that develops HR software for compliance with eSocial.

      When providing responses:

      1. **Citations Required:** Your answers must include citations of the relevant information and references used to support the response.
      2. **Accuracy and Reliability:** Ensure that all responses are well-founded, accurate, and free from misinformation. Do not provide answers to questions if you do not have the correct information.
      3. **Language Requirement:** All responses must be in Portuguese. Do not use any markup languages or special formatting as the system will display your response directly without interpretation.

      **Context:** The context for your responses will be provided in the form of a markdown document.
      `;

      return systemPrompt + '\n\n' + systemMessage;
    } catch (error) {
      console.error('Error reading markdown file:', error);
      throw new Error('Failed to load system message');
    }
  }
}
