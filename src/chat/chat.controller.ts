import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { GroqCloudService } from '../groq-cloud/groqCloud.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { User } from '../auth/schemas/user.schema';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groqCloudService: GroqCloudService,
  ) {}

  @UseGuards(AuthGuard())
  @Post()
  async createChat(
    @Req() req: Request & { user: User },
    @Body() createChatDto: CreateChatDto,
  ) {
    const firstMessageContent =
      createChatDto.messages?.[0]?.content || 'No prompt provided';
    const title =
      await this.groqCloudService.generateTitle(firstMessageContent);
    const chatDto = { ...createChatDto, title };
    const chat = await this.chatService.createChat(chatDto);
    return chat;
  }

  @UseGuards(AuthGuard())
  @Get(':id')
  async getChatById(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }

  @UseGuards(AuthGuard())
  @Get('user/:userId')
  async getChatsByUserId(@Req() req: Request & { user: User }) {
    const currentUserId = req.user.id;
    return this.chatService.getChatsByUserId(currentUserId);
  }

  @UseGuards(AuthGuard())
  @Post('send/:id?')
  async sendMessageToChat(
    @Param('id') id: string | null,
    @Body() body: { prompt: string },
    @Req() req: Request & { user: User },
  ) {
    let chat;
    const userId = req.user.id;
    if (id) {
      // Atualizar um chat existente
      chat = await this.chatService.getChatById(id);
      const chatMessagesContent = chat.messages.map((msg) => msg.content);
      const response = await this.groqCloudService.getChatResponse(
        body.prompt,
        chatMessagesContent,
      );
      chat.messages.push({ role: 'user', content: body.prompt });
      chat.messages.push({ role: 'assistant', content: response });
      chat = await this.chatService.updateChat(id, { messages: chat.messages });
    } else {
      // Criar um novo chat
      const firstMessageContent = body.prompt;
      const title =
        await this.groqCloudService.generateTitle(firstMessageContent);
      const response = await this.groqCloudService.getChatResponse(
        firstMessageContent,
        [firstMessageContent],
      );
      const createChatDto = {
        userId: userId,
        title,
        messages: [
          { role: 'user', content: firstMessageContent },
          { role: 'assistant', content: response },
        ],
      };
      chat = await this.chatService.createChat(createChatDto);
    }

    return chat;
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  async deleteChat(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }
}
