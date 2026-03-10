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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const email_provider_1 = require("./providers/email.provider");
const whatsapp_provider_1 = require("./providers/whatsapp.provider");
const notification_schema_1 = require("../../infra/database/schemas/notification.schema");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let NotificationService = class NotificationService {
    notificationModel;
    emailProvider;
    whatsAppProvider;
    configService;
    constructor(notificationModel, emailProvider, whatsAppProvider, configService) {
        this.notificationModel = notificationModel;
        this.emailProvider = emailProvider;
        this.whatsAppProvider = whatsAppProvider;
        this.configService = configService;
    }
    async sendFreeSessionConfirmation(data) {
        const message = `Hello ${data.parentName}, your free session request for ${data.kidName} has been confirmed!`;
        await Promise.all([
            this.emailProvider.send({
                to: data.email,
                subject: 'Free Session Confirmation',
                body: message,
            }),
            this.whatsAppProvider.send({
                to: data.phone,
                message,
            }),
        ]);
    }
    async sendSessionChange(data) {
        const message = `Your session has been updated: ${data.changes}`;
        await Promise.all([
            this.emailProvider.send({
                to: data.email,
                subject: 'Session Update',
                body: message,
            }),
            this.whatsAppProvider.send({
                to: data.phone,
                message,
            }),
        ]);
    }
    async sendInvoiceUpdate(data) {
        const message = `Your invoice status has been updated to: ${data.status}`;
        if (data.email) {
            await this.emailProvider.send({
                to: data.email,
                subject: 'Invoice Update',
                body: message,
            });
        }
        if (data.phone) {
            await this.whatsAppProvider.send({
                to: data.phone,
                message,
            });
        }
    }
    async sendRegistrationApproved(data) {
        const name = data.parentName ?? 'there';
        const message = `Hello ${name}, your Grow Fitness account has been approved. You can now sign in.`;
        const promises = [];
        if (data.email) {
            promises.push(this.emailProvider.send({
                to: data.email,
                subject: 'Account Approved',
                body: message,
            }));
        }
        if (data.phone) {
            promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
        }
        if (promises.length)
            await Promise.all(promises);
    }
    async sendCoachPayoutPaid(data) {
        const name = data.coachName ?? 'Coach';
        const message = `Hello ${name}, your monthly payment has been processed.`;
        const promises = [];
        if (data.email) {
            promises.push(this.emailProvider.send({
                to: data.email,
                subject: 'Payment Processed',
                body: message,
            }));
        }
        if (data.phone) {
            promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
        }
        if (promises.length)
            await Promise.all(promises);
    }
    async sendNewInvoiceToParent(data) {
        const name = data.recipientName ?? 'there';
        const message = `Hello ${name}, you have a new invoice from Grow Fitness. Please log in to view and pay.`;
        const promises = [];
        if (data.email) {
            promises.push(this.emailProvider.send({
                to: data.email,
                subject: 'New Invoice',
                body: message,
            }));
        }
        if (data.phone) {
            promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
        }
        if (promises.length)
            await Promise.all(promises);
    }
    async sendPaymentReminder(data) {
        const name = data.recipientName ?? 'there';
        const message = `Hello ${name}, friendly reminder: you have an outstanding invoice from Grow Fitness. Please log in to view and pay before month end.`;
        const promises = [];
        if (data.email) {
            promises.push(this.emailProvider.send({
                to: data.email,
                subject: 'Reminder: Outstanding Invoice',
                body: message,
            }));
        }
        if (data.phone) {
            promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
        }
        if (promises.length)
            await Promise.all(promises);
    }
    async createNotification(dto) {
        const doc = new this.notificationModel({
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            type: dto.type,
            title: dto.title,
            body: dto.body,
            read: false,
            ...(dto.entityType && { entityType: dto.entityType }),
            ...(dto.entityId && { entityId: dto.entityId }),
        });
        return doc.save();
    }
    async findAllForUser(userId, pagination, filter) {
        const query = { userId: new mongoose_2.Types.ObjectId(userId) };
        if (filter?.read !== undefined) {
            query.read = filter.read;
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .exec(),
            this.notificationModel.countDocuments(query).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async getUnreadCount(userId) {
        const count = await this.notificationModel
            .countDocuments({ userId: new mongoose_2.Types.ObjectId(userId), read: false })
            .exec();
        return { count };
    }
    async markAsRead(id, userId) {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(id), userId: new mongoose_2.Types.ObjectId(userId) }, { $set: { read: true } }, { new: true })
            .exec();
        if (!notification) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Notification not found',
            });
        }
        return notification;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel
            .updateMany({ userId: new mongoose_2.Types.ObjectId(userId), read: false }, { $set: { read: true } })
            .exec();
        return { count: result.modifiedCount };
    }
    async deleteOne(id, userId) {
        const result = await this.notificationModel
            .findOneAndDelete({
            _id: new mongoose_2.Types.ObjectId(id),
            userId: new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Notification not found',
            });
        }
    }
    async deleteAll(userId) {
        const result = await this.notificationModel
            .deleteMany({ userId: new mongoose_2.Types.ObjectId(userId) })
            .exec();
        return { deletedCount: result.deletedCount };
    }
    async sendPasswordResetEmail(user, resetToken) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        const userName = user.parentProfile?.name || user.coachProfile?.name || 'User';
        const expiryHours = parseInt(this.configService.get('PASSWORD_RESET_TOKEN_EXPIRY', '3600'), 10) / 3600;
        const subject = 'Reset Your Password';
        const body = `Hello ${userName},

You requested to reset your password for your Grow Fitness account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}.

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, please do not share this link with anyone.

Best regards,
Grow Fitness Team`;
        await this.emailProvider.send({
            to: user.email,
            subject,
            body,
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        email_provider_1.EmailProvider,
        whatsapp_provider_1.WhatsAppProvider,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notifications.service.js.map