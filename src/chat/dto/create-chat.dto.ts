import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateChatDto {
  @IsString()
  readonly userId: string;

  @IsString()
  @IsOptional()
  readonly title: string;

  @IsArray()
  @IsOptional()
  readonly messages?: { role: string; content: string }[];
}
