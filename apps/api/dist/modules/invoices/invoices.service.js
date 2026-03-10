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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("../../infra/database/schemas/invoice.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const shared_types_2 = require("@grow-fitness/shared-types");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let InvoicesService = class InvoicesService {
    invoiceModel;
    userModel;
    auditService;
    notificationService;
    constructor(invoiceModel, userModel, auditService, notificationService) {
        this.invoiceModel = invoiceModel;
        this.userModel = userModel;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async findAll(pagination, filters) {
        const query = {};
        if (filters?.type) {
            query.type = filters.type;
        }
        if (filters?.parentId) {
            query.parentId = filters.parentId;
        }
        if (filters?.coachId) {
            query.coachId = filters.coachId;
        }
        if (filters?.status) {
            query.status = filters.status;
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.invoiceModel
                .find(query)
                .populate('parentId', 'email parentProfile')
                .populate('coachId', 'email coachProfile')
                .sort({ dueDate: 1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean()
                .exec(),
            this.invoiceModel.countDocuments(query).exec(),
        ]);
        const transformedData = data.map(inv => this.toInvoiceResponse(inv));
        return new pagination_dto_1.PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const invoice = await this.invoiceModel
            .findById(id)
            .populate('parentId', 'email parentProfile')
            .populate('coachId', 'email coachProfile')
            .lean()
            .exec();
        if (!invoice) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.INVOICE_NOT_FOUND,
                message: 'Invoice not found',
            });
        }
        return this.toInvoiceResponse(invoice);
    }
    toInvoiceResponse(inv) {
        const parentIdVal = inv.parentId?._id ?? inv.parentId;
        const coachIdVal = inv.coachId?._id ?? inv.coachId;
        const parent = inv.parentId && typeof inv.parentId === 'object'
            ? {
                id: inv.parentId._id?.toString(),
                email: inv.parentId.email,
                parentProfile: inv.parentId.parentProfile,
            }
            : undefined;
        const coach = inv.coachId && typeof inv.coachId === 'object'
            ? {
                id: inv.coachId._id?.toString(),
                email: inv.coachId.email,
                coachProfile: inv.coachId.coachProfile,
            }
            : undefined;
        return {
            id: inv._id?.toString(),
            type: inv.type,
            parentId: parentIdVal != null ? parentIdVal.toString() : undefined,
            coachId: coachIdVal != null ? coachIdVal.toString() : undefined,
            parent,
            coach,
            items: inv.items,
            totalAmount: inv.totalAmount,
            status: inv.status,
            dueDate: inv.dueDate,
            paidAt: inv.paidAt,
            exportFields: inv.exportFields,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
        };
    }
    async create(createInvoiceDto, actorId) {
        const totalAmount = createInvoiceDto.items.reduce((sum, item) => sum + item.amount, 0);
        const invoice = new this.invoiceModel({
            ...createInvoiceDto,
            totalAmount,
            dueDate: new Date(createInvoiceDto.dueDate),
            status: shared_types_1.InvoiceStatus.PENDING,
        });
        await invoice.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_INVOICE',
            entityType: 'Invoice',
            entityId: invoice._id.toString(),
            metadata: createInvoiceDto,
        });
        const invoiceIdStr = invoice._id.toString();
        if (invoice.type === shared_types_1.InvoiceType.PARENT_INVOICE && invoice.parentId) {
            const parentIdStr = invoice.parentId.toString();
            const parent = await this.userModel
                .findById(parentIdStr)
                .select('email phone parentProfile')
                .lean()
                .exec();
            await this.notificationService.createNotification({
                userId: parentIdStr,
                type: shared_types_2.NotificationType.INVOICE_CREATED,
                title: 'New invoice',
                body: 'A new invoice has been issued for you. Please log in to view and pay.',
                entityType: 'Invoice',
                entityId: invoiceIdStr,
            });
            if (parent) {
                const p = parent;
                await this.notificationService.sendNewInvoiceToParent({
                    email: p.email,
                    phone: p.phone ?? '',
                    recipientName: p.parentProfile?.name,
                });
            }
        }
        if (invoice.type === shared_types_1.InvoiceType.COACH_PAYOUT && invoice.coachId) {
            const coachIdStr = invoice.coachId.toString();
            await this.notificationService.createNotification({
                userId: coachIdStr,
                type: shared_types_2.NotificationType.INVOICE_CREATED,
                title: 'New payout invoice',
                body: 'A new payout invoice has been created for you.',
                entityType: 'Invoice',
                entityId: invoiceIdStr,
            });
        }
        return this.findById(invoiceIdStr);
    }
    async updatePaymentStatus(id, updateDto, actorId) {
        const invoice = await this.invoiceModel.findById(id).exec();
        if (!invoice) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.INVOICE_NOT_FOUND,
                message: 'Invoice not found',
            });
        }
        invoice.status = updateDto.status;
        if (updateDto.status === shared_types_1.InvoiceStatus.PAID && updateDto.paidAt) {
            invoice.paidAt = new Date(updateDto.paidAt);
        }
        await invoice.save();
        if (invoice.type === shared_types_1.InvoiceType.PARENT_INVOICE && invoice.parentId) {
            const parentIdStr = invoice.parentId.toString();
            const parent = await this.userModel.findById(parentIdStr).select('email phone').lean().exec();
            const email = parent ? parent.email : undefined;
            const phone = parent ? parent.phone : undefined;
            await this.notificationService.sendInvoiceUpdate({
                invoiceId: invoice._id.toString(),
                parentId: parentIdStr,
                status: updateDto.status,
                email,
                phone,
            });
            await this.notificationService.createNotification({
                userId: parentIdStr,
                type: shared_types_2.NotificationType.INVOICE_STATUS_UPDATED,
                title: 'Invoice updated',
                body: `Your invoice status has been updated to: ${updateDto.status}.`,
                entityType: 'Invoice',
                entityId: invoice._id.toString(),
            });
        }
        if (invoice.type === shared_types_1.InvoiceType.COACH_PAYOUT && invoice.coachId) {
            const coachIdStr = invoice.coachId.toString();
            await this.notificationService.createNotification({
                userId: coachIdStr,
                type: shared_types_2.NotificationType.INVOICE_STATUS_UPDATED,
                title: 'Payout invoice updated',
                body: updateDto.status === shared_types_1.InvoiceStatus.PAID
                    ? 'Your payout has been marked as paid.'
                    : `Your payout invoice status has been updated to: ${updateDto.status}.`,
                entityType: 'Invoice',
                entityId: invoice._id.toString(),
            });
            if (updateDto.status === shared_types_1.InvoiceStatus.PAID) {
                const coach = await this.userModel
                    .findById(coachIdStr)
                    .select('email phone coachProfile')
                    .lean()
                    .exec();
                if (coach) {
                    const c = coach;
                    await this.notificationService.sendCoachPayoutPaid({
                        email: c.email,
                        phone: c.phone ?? '',
                        coachName: c.coachProfile?.name,
                        invoiceId: invoice._id.toString(),
                    });
                }
            }
        }
        await this.auditService.log({
            actorId,
            action: 'UPDATE_INVOICE_PAYMENT_STATUS',
            entityType: 'Invoice',
            entityId: id,
            metadata: updateDto,
        });
        return this.findById(id);
    }
    async getFinanceSummary() {
        const [totalRevenue, pendingAmount, overdueAmount] = await Promise.all([
            this.invoiceModel
                .aggregate([
                { $match: { status: shared_types_1.InvoiceStatus.PAID } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ])
                .exec(),
            this.invoiceModel
                .aggregate([
                { $match: { status: shared_types_1.InvoiceStatus.PENDING } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ])
                .exec(),
            this.invoiceModel
                .aggregate([
                {
                    $match: {
                        status: shared_types_1.InvoiceStatus.OVERDUE,
                        dueDate: { $lt: new Date() },
                    },
                },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ])
                .exec(),
        ]);
        return {
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingAmount: pendingAmount[0]?.total || 0,
            overdueAmount: overdueAmount[0]?.total || 0,
        };
    }
    async exportCSV(filters) {
        const query = {};
        if (filters?.type) {
            query.type = filters.type;
        }
        if (filters?.parentId) {
            query.parentId = filters.parentId;
        }
        if (filters?.coachId) {
            query.coachId = filters.coachId;
        }
        if (filters?.status) {
            query.status = filters.status;
        }
        const invoices = await this.invoiceModel
            .find(query)
            .populate('parentId')
            .populate('coachId')
            .exec();
        const headers = ['ID', 'Type', 'Parent/Coach', 'Total Amount', 'Status', 'Due Date', 'Paid At'];
        const rows = invoices.map(invoice => [
            invoice._id.toString(),
            invoice.type,
            invoice.type === shared_types_1.InvoiceType.PARENT_INVOICE
                ? invoice.parentId?.email || 'N/A'
                : invoice.coachId?.email || 'N/A',
            invoice.totalAmount,
            invoice.status,
            invoice.dueDate.toISOString(),
            invoice.paidAt?.toISOString() || 'N/A',
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return csv;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService,
        notifications_service_1.NotificationService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map