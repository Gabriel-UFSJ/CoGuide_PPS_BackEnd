// src/chat/chat.controller.ts
import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GroqCloudService } from '../../src/groq-cloud/groq-cloud.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groqCloudService: GroqCloudService
  ) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto) {
    const chat = await this.chatService.createChat(createChatDto);
    return chat;
  }

  @Get(':id')
  async getChatById(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }

  @Get('user/:userId')
  async getChatsByUserId(@Param('userId') userId: string) {
    return this.chatService.getChatsByUserId(userId);
  }

  @Post('send/:id')
  async sendMessageToChat(@Param('id') id: string, @Body() body: { prompt: string }) {
    const chat = await this.chatService.getChatById(id);
    const response = await this.groqCloudService.getChatResponse(body.prompt, chat.messages);
    chat.messages.push(body.prompt, response);
    await this.chatService.updateChat(id, { messages: chat.messages });
    return { response };
  }

  @Delete(':id')
  async deleteChat(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }
}
