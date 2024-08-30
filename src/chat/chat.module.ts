import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GroqCloudService } from '../groq-cloud/groqCloud.service';
import { ChatSchema } from './schemas/chat.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService, GroqCloudService],
})
export class ChatModule {}
