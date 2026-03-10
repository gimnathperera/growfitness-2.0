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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const support_chat_service_1 = require("./support-chat.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let SupportChatController = class SupportChatController {
    supportChatService;
    constructor(supportChatService) {
        this.supportChatService = supportChatService;
    }
    async sendMessage(dto) {
        const messages = dto.messages.map(m => ({
            role: m.role,
            content: String(m.content).trim(),
        }));
        const last = messages[messages.length - 1];
        if (!last || last.role !== 'user') {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                message: 'Last message must be from the user.',
            });
        }
        return this.supportChatService.sendMessage(messages);
    }
};
exports.SupportChatController = SupportChatController;
__decorate([
    (0, common_1.Post)('message'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message and get an AI support reply' }),
    (0, swagger_1.ApiBody)({ type: send_message_dto_1.SendMessageDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assistant reply' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], SupportChatController.prototype, "sendMessage", null);
exports.SupportChatController = SupportChatController = __decorate([
    (0, swagger_1.ApiTags)('support-chat'),
    (0, common_1.Controller)('support-chat'),
    __metadata("design:paramtypes", [support_chat_service_1.SupportChatService])
], SupportChatController);
//# sourceMappingURL=support-chat.controller.js.map