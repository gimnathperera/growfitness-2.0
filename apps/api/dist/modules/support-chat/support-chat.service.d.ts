import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SupportChatService implements OnModuleInit {
    private readonly configService;
    private knowledgeContext;
    private openai;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private getKnowledgePath;
    private loadKnowledge;
    getKnowledgeContext(): string;
    private buildSystemPrompt;
    sendMessage(messages: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>): Promise<{
        message: string;
    }>;
}
