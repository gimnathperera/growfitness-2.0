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
var RemindersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const invoice_schema_1 = require("../../infra/database/schemas/invoice.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const shared_types_1 = require("@grow-fitness/shared-types");
const shared_types_2 = require("@grow-fitness/shared-types");
let RemindersService = RemindersService_1 = class RemindersService {
    sessionModel;
    invoiceModel;
    userModel;
    kidModel;
    notificationService;
    logger = new common_1.Logger(RemindersService_1.name);
    constructor(sessionModel, invoiceModel, userModel, kidModel, notificationService) {
        this.sessionModel = sessionModel;
        this.invoiceModel = invoiceModel;
        this.userModel = userModel;
        this.kidModel = kidModel;
        this.notificationService = notificationService;
    }
    async remindAdminsToCreateInvoices() {
        this.logger.log('Running invoice creation reminder (admins)');
        try {
            const end = new Date();
            const start = new Date(end);
            start.setDate(start.getDate() - 7);
            const completed = await this.sessionModel
                .countDocuments({
                dateTime: { $gte: start, $lte: end },
                status: shared_types_1.SessionStatus.COMPLETED,
            })
                .exec();
            if (completed === 0)
                return;
            const admins = await this.userModel
                .find({ role: shared_types_1.UserRole.ADMIN })
                .select('_id')
                .lean()
                .exec();
            const title = 'Reminder: Create and send invoices';
            const body = `You have ${completed} completed session(s) in the past 7 days. Remember to create and send invoices.`;
            for (const a of admins) {
                const id = a._id?.toString?.();
                if (id) {
                    await this.notificationService.createNotification({
                        userId: id,
                        type: shared_types_2.NotificationType.INVOICE_CREATION_REMINDER,
                        title,
                        body,
                        entityType: 'Session',
                    });
                }
            }
        }
        catch (err) {
            this.logger.error('invoice-creation-reminder failed', err);
        }
    }
    async remindParentsToPayInvoices() {
        this.logger.log('Running invoice payment reminder (parents)');
        try {
            const inThreeDays = new Date();
            inThreeDays.setDate(inThreeDays.getDate() + 3);
            const invoices = await this.invoiceModel
                .find({
                type: shared_types_1.InvoiceType.PARENT_INVOICE,
                status: shared_types_1.InvoiceStatus.PENDING,
                dueDate: { $lte: inThreeDays },
                parentId: { $exists: true, $ne: null },
            })
                .populate('parentId', 'email phone parentProfile')
                .lean()
                .exec();
            const seen = new Set();
            for (const inv of invoices) {
                const parentId = inv.parentId?._id?.toString?.() ?? inv.parentId?.toString?.();
                if (!parentId || seen.has(parentId))
                    continue;
                seen.add(parentId);
                await this.notificationService.createNotification({
                    userId: parentId,
                    type: shared_types_2.NotificationType.INVOICE_PAYMENT_REMINDER,
                    title: 'Reminder: Pay your invoice',
                    body: 'You have an outstanding or soon-due invoice. Please log in to view and pay.',
                    entityType: 'Invoice',
                    entityId: inv._id?.toString?.(),
                });
            }
        }
        catch (err) {
            this.logger.error('invoice-payment-reminder failed', err);
        }
    }
    async sendMonthEndPaymentReminder() {
        this.logger.log('Running month-end payment reminder (parents WhatsApp/email)');
        try {
            const invoices = await this.invoiceModel
                .find({
                type: shared_types_1.InvoiceType.PARENT_INVOICE,
                status: shared_types_1.InvoiceStatus.PENDING,
                parentId: { $exists: true, $ne: null },
            })
                .populate('parentId', 'email phone parentProfile')
                .lean()
                .exec();
            const seen = new Set();
            for (const inv of invoices) {
                const parent = inv.parentId;
                if (!parent)
                    continue;
                const parentId = parent._id?.toString?.() ?? parent;
                if (typeof parentId !== 'string')
                    continue;
                if (seen.has(parentId))
                    continue;
                seen.add(parentId);
                const email = parent.email;
                const phone = parent.phone;
                const name = parent.parentProfile?.name;
                if (email || phone) {
                    await this.notificationService.sendPaymentReminder({
                        email,
                        phone: phone ?? '',
                        recipientName: name,
                    });
                }
                await this.notificationService.createNotification({
                    userId: parentId,
                    type: shared_types_2.NotificationType.MONTH_END_PAYMENT_REMINDER,
                    title: 'Month-end reminder: Outstanding invoice',
                    body: 'Please pay your outstanding invoice before month end.',
                    entityType: 'Invoice',
                    entityId: inv._id?.toString?.(),
                });
            }
        }
        catch (err) {
            this.logger.error('month-end-payment-reminder failed', err);
        }
    }
    async sendUpcomingSessionReminder() {
        this.logger.log('Running upcoming session reminder');
        try {
            const now = new Date();
            const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const sessions = await this.sessionModel
                .find({
                dateTime: { $gte: now, $lte: in24h },
                status: { $in: [shared_types_1.SessionStatus.SCHEDULED, shared_types_1.SessionStatus.CONFIRMED] },
            })
                .populate('coachId', '_id')
                .populate('kids')
                .lean()
                .exec();
            for (const s of sessions) {
                const sessionId = s._id?.toString?.();
                const title = s.title;
                const dateStr = s.dateTime ? new Date(s.dateTime).toLocaleString() : '';
                if (s.coachId?._id) {
                    const coachId = s.coachId._id.toString();
                    await this.notificationService.createNotification({
                        userId: coachId,
                        type: shared_types_2.NotificationType.UPCOMING_SESSION_REMINDER,
                        title: 'Upcoming session',
                        body: `Reminder: "${title}" is scheduled within the next 24 hours (${dateStr}).`,
                        entityType: 'Session',
                        entityId: sessionId,
                    });
                }
                const kidIds = s.kids ?? [];
                const objectKidIds = kidIds.map((k) => k && typeof k === 'object' && k._id ? k._id : k);
                if (objectKidIds.length === 0)
                    continue;
                const kids = await this.kidModel
                    .find({ _id: { $in: objectKidIds } })
                    .select('parentId')
                    .lean()
                    .exec();
                const parentIds = new Set();
                for (const k of kids) {
                    const pid = k.parentId?.toString?.();
                    if (pid)
                        parentIds.add(pid);
                }
                for (const parentId of parentIds) {
                    await this.notificationService.createNotification({
                        userId: parentId,
                        type: shared_types_2.NotificationType.UPCOMING_SESSION_REMINDER,
                        title: 'Upcoming session',
                        body: `Reminder: "${title}" is scheduled within the next 24 hours (${dateStr}).`,
                        entityType: 'Session',
                        entityId: sessionId,
                    });
                }
            }
        }
        catch (err) {
            this.logger.error('upcoming-session-reminder failed', err);
        }
    }
};
exports.RemindersService = RemindersService;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *', { name: 'invoice-creation-reminder' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "remindAdminsToCreateInvoices", null);
__decorate([
    (0, schedule_1.Cron)('0 10 * * *', { name: 'invoice-payment-reminder' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "remindParentsToPayInvoices", null);
__decorate([
    (0, schedule_1.Cron)('0 11 25 * *', { name: 'month-end-payment-reminder' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "sendMonthEndPaymentReminder", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *', { name: 'upcoming-session-reminder' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemindersService.prototype, "sendUpcomingSessionReminder", null);
exports.RemindersService = RemindersService = RemindersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __param(1, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationService])
], RemindersService);
//# sourceMappingURL=reminders.service.js.map