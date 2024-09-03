import { Injectable } from '@nestjs/common';
import GroqClient from 'groq-sdk';
import * as fs from 'fs';
import { OllamaEmbeddings } from '@langchain/ollama';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  RunnablePassthrough,
  RunnableSequence,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

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
      const markdownPath =
        'C:\\Users\\gabri\\OneDrive\\Faculdade\\Programas\\2024.1\\PPS\\CoGuide_PPS_BackEnd\\storage\\output.md';

      if (!fs.existsSync(markdownPath)) {
        throw new Error(`Markdown file not found at path: ${markdownPath}`);
      }

      const systemMessage = await fs.promises.readFile(markdownPath, 'utf8');

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

  async retriever(): Promise<string> {
    const markdownPath =
      '/home/gabriel.meireles@sh3.local/Faculdade/2024.1/co-guide_pps_back-end/storage/output.md';

    if (!fs.existsSync(markdownPath)) {
      throw new Error(`Markdown file not found at path: ${markdownPath}`);
    }

    const markdownContent = fs.readFileSync(markdownPath, 'utf8');

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 100,
    });

    const formatDocumentsAsString = (documents: Document[]) => {
      return documents.map((document) => document.pageContent).join('\n\n');
    };

    const texts = await textSplitter.splitText(markdownContent);
    const docs = texts.map((text) => new Document({ pageContent: text }));

    const embeddings = new OllamaEmbeddings({
      model: 'mxbai-embed-large ',
      baseUrl: 'http://localhost:11434',
    });

    const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
      collectionName: 'CoGuide_System_Message',
    });

    const vectorStoreRetriever = vectorStore.asRetriever({ k: 3 });

    const SYSTEM_TEMPLATE = `
      You are a technical assistant responsible for answering questions about the eSocial processes of the Brazilian federal government. Your main objective is to serve as an additional channel for responding to inquiries within a company that develops HR software for compliance with eSocial.

      When providing responses:

      1. **Citations Required:** Your answers must include citations of the relevant information and references used to support the response.
      2. **Accuracy and Reliability:** Ensure that all responses are well-founded, accurate, and free from misinformation. Do not provide answers to questions if you do not have the correct information.
      3. **Language Requirement:** All responses must be in Portuguese. Do not use any markup languages or special formatting as the system will display your response directly without interpretation.

      **Context:** The context for your responses will be provided in the form of a markdown document.
      ----------------
      {context}
      ----------------
      {question}
    `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_TEMPLATE],
      ['human', '{question}'],
    ]);

    const chain = RunnableSequence.from([
      {
        context: vectorStoreRetriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke(
      'What did the president say about Justice Breyer?',
    );

    console.log({ answer });
    return 'sucess';
  }
}
