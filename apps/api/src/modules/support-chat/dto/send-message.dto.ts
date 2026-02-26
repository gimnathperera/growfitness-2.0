import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageDto } from './chat-message.dto';

export class SendMessageDto {
  @ApiProperty({ type: [ChatMessageDto], maxItems: 12 })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @ArrayMaxSize(12)
  messages: ChatMessageDto[];
}
