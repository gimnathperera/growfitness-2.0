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
var EmailProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailProvider = EmailProvider_1 = class EmailProvider {
    configService;
    logger = new common_1.Logger(EmailProvider_1.name);
    transporter = null;
    constructor(configService) {
        this.configService = configService;
        this.initializeTransporter();
    }
    initializeTransporter() {
        const emailEnabled = this.configService.get('EMAIL_ENABLED', 'false') === 'true';
        const smtpHost = this.configService.get('SMTP_HOST');
        const smtpPort = parseInt(this.configService.get('SMTP_PORT', '587'), 10);
        const smtpUser = this.configService.get('SMTP_USER');
        const smtpPassword = this.configService.get('SMTP_PASSWORD');
        const smtpFrom = this.configService.get('SMTP_FROM', smtpUser ?? 'noreply@growfitness.com');
        if (!emailEnabled) {
            this.logger.warn('Email is disabled. Set EMAIL_ENABLED=true to enable email sending.');
            return;
        }
        if (!smtpHost || !smtpUser || !smtpPassword) {
            this.logger.warn('SMTP configuration incomplete. Email sending will be disabled. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.');
            return;
        }
        try {
            this.transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPassword,
                },
                ...(smtpHost.includes('gmail.com') && {
                    service: 'gmail',
                }),
            });
            this.logger.log('Email transporter initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize email transporter:', error);
            this.transporter = null;
        }
    }
    async send(data) {
        if (!this.transporter) {
            this.logger.log('[EMAIL PROVIDER - MOCK MODE]', {
                to: data.to,
                subject: data.subject,
                body: data.body,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        try {
            const smtpFrom = this.configService.get('SMTP_FROM', this.configService.get('SMTP_USER', 'noreply@growfitness.com'));
            const mailOptions = {
                from: smtpFrom,
                to: data.to,
                subject: data.subject,
                text: data.body,
            };
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${data.to}. Message ID: ${info.messageId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${data.to}:`, error);
            throw error;
        }
    }
};
exports.EmailProvider = EmailProvider;
exports.EmailProvider = EmailProvider = EmailProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProvider);
//# sourceMappingURL=email.provider.js.map