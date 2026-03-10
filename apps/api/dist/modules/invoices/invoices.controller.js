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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const get_invoices_query_dto_1 = require("./dto/get-invoices-query.dto");
const invoice_response_dto_1 = require("./dto/invoice-response.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    findAll(query) {
        const { page, limit, type, parentId, coachId, status } = query;
        return this.invoicesService.findAll({ page, limit }, { type, parentId, coachId, status });
    }
    findById(id) {
        return this.invoicesService.findById(id);
    }
    create(createInvoiceDto, actorId) {
        return this.invoicesService.create(createInvoiceDto, actorId);
    }
    updatePaymentStatus(id, updateDto, actorId) {
        return this.invoicesService.updatePaymentStatus(id, updateDto, actorId);
    }
    async exportCSV(res, type, parentId, coachId, status) {
        const csv = await this.invoicesService.exportCSV({ type, parentId, coachId, status });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
        res.send(csv);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all invoices' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of invoices. Each invoice includes parentId/coachId as IDs and optional parent/coach when expanded.',
        type: invoice_response_dto_1.PaginatedInvoiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (e.g. invalid query params)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_invoices_query_dto_1.GetInvoicesQueryDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice by ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Invoice details with optional parent/coach populated.',
        type: invoice_response_dto_1.InvoiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invoice' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['PARENT_INVOICE', 'COACH_PAYOUT'],
                    description: 'Invoice type',
                    example: 'PARENT_INVOICE',
                },
                parentId: {
                    type: 'string',
                    description: 'Parent ID (required for PARENT_INVOICE, MongoDB ObjectId)',
                    example: '507f1f77bcf86cd799439011',
                },
                coachId: {
                    type: 'string',
                    description: 'Coach ID (required for COACH_PAYOUT, MongoDB ObjectId)',
                    example: '507f1f77bcf86cd799439011',
                },
                items: {
                    type: 'array',
                    description: 'Invoice line items',
                    items: {
                        type: 'object',
                        properties: {
                            description: {
                                type: 'string',
                                description: 'Item description',
                                example: 'Monthly training sessions',
                            },
                            amount: {
                                type: 'number',
                                description: 'Item amount (must be >= 0)',
                                example: 500.0,
                                minimum: 0,
                            },
                        },
                        required: ['description', 'amount'],
                    },
                    example: [
                        { description: 'Monthly training sessions', amount: 500.0 },
                        { description: 'Equipment fee', amount: 50.0 },
                    ],
                },
                dueDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Due date (ISO format)',
                    example: '2024-12-31',
                },
            },
            required: ['type', 'items', 'dueDate'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Invoice created successfully. Returns invoice with optional parent/coach populated.',
        type: invoice_response_dto_1.InvoiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent or Coach not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update invoice payment status' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['PENDING', 'PAID', 'OVERDUE'],
                    description: 'Payment status',
                    example: 'PAID',
                },
                paidAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Payment date/time (ISO format, optional, required when status is PAID)',
                    example: '2024-12-15T10:30:00Z',
                },
            },
            required: ['status'],
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Payment status updated. Returns invoice with optional parent/coach populated.',
        type: invoice_response_dto_1.InvoiceResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invoice not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updatePaymentStatus", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export invoices as CSV' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        required: false,
        enum: ['PARENT_INVOICE', 'COACH_PAYOUT'],
        description: 'Filter by invoice type',
    }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', required: false, type: String, description: 'Filter by parent ID' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: ['PENDING', 'PAID', 'OVERDUE'],
        description: 'Filter by invoice status',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSV file download' }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('parentId')),
    __param(3, (0, common_1.Query)('coachId')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "exportCSV", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('invoices'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map