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
var WhatsAppProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
const phone_util_1 = require("./phone.util");
let WhatsAppProvider = WhatsAppProvider_1 = class WhatsAppProvider {
    configService;
    logger = new common_1.Logger(WhatsAppProvider_1.name);
    client = null;
    enabled;
    from;
    defaultCountryCode;
    constructor(configService) {
        this.configService = configService;
        this.enabled =
            this.configService.get('WHATSAPP_ENABLED', 'false') === 'true';
        this.from =
            this.configService.get('TWILIO_WHATSAPP_FROM', '') || '';
        this.defaultCountryCode =
            this.configService.get('WHATSAPP_DEFAULT_COUNTRY_CODE', '94');
        if (!this.enabled) {
            this.logger.warn('WhatsApp is disabled. Set WHATSAPP_ENABLED=true to enable sending.');
            return;
        }
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken || !this.from) {
            this.logger.warn('WhatsApp configuration incomplete. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886). Sending will be mocked.');
            return;
        }
        try {
            this.client = (0, twilio_1.default)(accountSid, authToken);
            this.logger.log('WhatsApp (Twilio) client initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Twilio client:', error);
            this.client = null;
        }
    }
    async send(data) {
        const toE164 = (0, phone_util_1.normalizeToE164)(data.to, this.defaultCountryCode);
        if (!toE164) {
            this.logger.warn(`WhatsApp skip: invalid or empty phone "${data.to?.slice(0, 6)}..."`);
            return;
        }
        if (!this.client) {
            this.logger.log('[WHATSAPP PROVIDER - MOCK MODE]', {
                to: toE164,
                message: data.message,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const toWhatsApp = toE164.startsWith('whatsapp:')
            ? toE164
            : `whatsapp:${toE164}`;
        try {
            const result = await this.client.messages.create({
                from: this.from.startsWith('whatsapp:') ? this.from : `whatsapp:${this.from}`,
                to: toWhatsApp,
                body: data.message,
            });
            this.logger.log(`WhatsApp sent successfully to ${toE164}. SID: ${result.sid}`);
        }
        catch (error) {
            this.logger.error(`Failed to send WhatsApp to ${toE164}:`, error);
            throw error;
        }
    }
};
exports.WhatsAppProvider = WhatsAppProvider;
exports.WhatsAppProvider = WhatsAppProvider = WhatsAppProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsAppProvider);
//# sourceMappingURL=whatsapp.provider.js.map