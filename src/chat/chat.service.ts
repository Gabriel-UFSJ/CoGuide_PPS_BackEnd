import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel('Chat') private readonly chatModel: Model<Chat>) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const createdChat = new this.chatModel(createChatDto);
    return createdChat.save();
  }

  async getChatById(id: string): Promise<Chat> {
    return this.chatModel.findById(id).exec();
  }

  async getChatsByUserId(userId: string): Promise<Chat[]> {
    return this.chatModel.find({ userId }).exec();
  }

  async updateChat(
    id: string,
    updateData: Partial<CreateChatDto>,
  ): Promise<Chat> {
    return this.chatModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async deleteChat(id: string): Promise<Chat> {
    return this.chatModel.findByIdAndDelete(id).exec();
  }
}
