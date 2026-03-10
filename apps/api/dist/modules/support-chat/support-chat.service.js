"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = require("fs");
const path = require("path");
const openai_1 = require("openai");
const KNOWLEDGE_DIR = 'knowledge';
const FILES = ['business.json', 'procedures.md', 'faq.md', 'payments.md'];
let SupportChatService = class SupportChatService {
    configService;
    knowledgeContext = '';
    openai = null;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey?.trim()) {
            throw new Error('OPENAI_API_KEY is required. Set it in .env or .env.local and restart the API.');
        }
        this.openai = new openai_1.default({ apiKey: apiKey.trim() });
        this.loadKnowledge();
    }
    getKnowledgePath() {
        const base = process.cwd();
        const candidate = path.join(base, 'src', KNOWLEDGE_DIR);
        if (fs.existsSync(candidate)) {
            return candidate;
        }
        const distCandidate = path.join(base, KNOWLEDGE_DIR);
        if (fs.existsSync(distCandidate)) {
            return distCandidate;
        }
        throw new Error(`Knowledge directory not found. Tried: ${candidate} and ${distCandidate}. Ensure apps/api/src/knowledge exists.`);
    }
    loadKnowledge() {
        const dir = this.getKnowledgePath();
        const parts = [];
        for (const file of FILES) {
            const filePath = path.join(dir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Missing knowledge file: ${filePath}. All of ${FILES.join(', ')} are required.`);
            }
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            parts.push(`## ${file}\n${content}`);
        }
        this.knowledgeContext = parts.join('\n\n');
    }
    getKnowledgeContext() {
        return this.knowledgeContext;
    }
    buildSystemPrompt() {
        return `You are a friendly, English-only support assistant for Grow Fitness. You must follow these rules strictly:

1. Use ONLY the knowledge content provided below to answer. Do not guess, invent, or assume any information.
2. If the user's question is not clearly answered by the knowledge content, respond with: "I'm not sure based on the info I have." Then provide the support contact (email and any phone) and relevant links from the business info. You may ask one short clarifying question if it helps.
3. Be concise and friendly. For procedures, give step-by-step instructions. When relevant, offer links to pages (from the business links).
4. Never invent phone numbers, emails, prices, policies, availability, or timings. Only use what appears in the knowledge content.

Knowledge content:

${this.getKnowledgeContext()}`;
    }
    async sendMessage(messages) {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized.');
        }
        const last = messages[messages.length - 1];
        if (!last || last.role !== 'user') {
            throw new Error('Last message must be from the user.');
        }
        const systemPrompt = this.buildSystemPrompt();
        const openAiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({
                role: m.role,
                content: m.content.trim(),
            })),
        ];
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: openAiMessages,
                max_tokens: 1024,
                temperature: 0.3,
            });
            const choice = completion.choices?.[0];
            const content = choice?.message?.content?.trim();
            if (!content) {
                return {
                    message: "I couldn't generate a reply. Please try again or contact support using the details on our contact page.",
                };
            }
            return { message: content };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            if (message.includes('rate') || message.includes('overloaded')) {
                return {
                    message: 'Support chat is busy. Please try again in a moment or contact us directly using the email on our contact page.',
                };
            }
            throw err;
        }
    }
};
exports.SupportChatService = SupportChatService;
exports.SupportChatService = SupportChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupportChatService);
//# sourceMappingURL=support-chat.service.js.map