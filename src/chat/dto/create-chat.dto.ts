import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  readonly userId: string;

  @IsArray()
  @IsOptional()
  readonly messages?: string[];
}