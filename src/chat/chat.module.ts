import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GroqCloudService } from '../../src/groq-cloud/groq-cloud.service';
import { ChatSchema } from './schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]), // 'Chat' is used as the model name here
  ],
  controllers: [ChatController],
  providers: [ChatService, GroqCloudService],
})
export class ChatModule {}