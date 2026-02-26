import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SupportChatService } from './support-chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@ApiTags('support-chat')
@Controller('support-chat')
export class SupportChatController {
  constructor(private readonly supportChatService: SupportChatService) {}

  @Post('message')
  @Public()
  @ApiOperation({ summary: 'Send a message and get an AI support reply' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Assistant reply' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async sendMessage(@Body() dto: SendMessageDto) {
    const messages = dto.messages.map(m => ({
      role: m.role,
      content: String(m.content).trim(),
    }));
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') {
      throw new BadRequestException({
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'Last message must be from the user.',
      });
    }
    return this.supportChatService.sendMessage(messages);
  }
}
