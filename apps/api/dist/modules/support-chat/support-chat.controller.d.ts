import { SupportChatService } from './support-chat.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class SupportChatController {
    private readonly supportChatService;
    constructor(supportChatService: SupportChatService);
    sendMessage(dto: SendMessageDto): Promise<{
        message: string;
    }>;
}
