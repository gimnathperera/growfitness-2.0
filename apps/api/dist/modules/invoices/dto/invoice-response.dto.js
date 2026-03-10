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
exports.PaginatedInvoiceResponseDto = exports.InvoiceResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InvoiceParentRefDto {
    id;
    email;
    parentProfile;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], InvoiceParentRefDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'parent@example.com' }),
    __metadata("design:type", String)
], InvoiceParentRefDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent profile',
        example: { name: 'John', location: 'NYC' },
    }),
    __metadata("design:type", Object)
], InvoiceParentRefDto.prototype, "parentProfile", void 0);
class InvoiceCoachRefDto {
    id;
    email;
    coachProfile;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], InvoiceCoachRefDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'coach@example.com' }),
    __metadata("design:type", String)
], InvoiceCoachRefDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Coach profile', example: { name: 'Jane' } }),
    __metadata("design:type", Object)
], InvoiceCoachRefDto.prototype, "coachProfile", void 0);
class InvoiceItemDto {
    description;
    amount;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    __metadata("design:type", Number)
], InvoiceItemDto.prototype, "amount", void 0);
class InvoiceResponseDto {
    id;
    type;
    parentId;
    coachId;
    parent;
    coach;
    items;
    totalAmount;
    status;
    dueDate;
    paidAt;
    exportFields;
    createdAt;
    updatedAt;
}
exports.InvoiceResponseDto = InvoiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], InvoiceResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PARENT_INVOICE', 'COACH_PAYOUT'] }),
    __metadata("design:type", String)
], InvoiceResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Parent user ID' }),
    __metadata("design:type", String)
], InvoiceResponseDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Coach user ID' }),
    __metadata("design:type", String)
], InvoiceResponseDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated when parentId is expanded' }),
    __metadata("design:type", InvoiceParentRefDto)
], InvoiceResponseDto.prototype, "parent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated when coachId is expanded' }),
    __metadata("design:type", InvoiceCoachRefDto)
], InvoiceResponseDto.prototype, "coach", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InvoiceItemDto] }),
    __metadata("design:type", Array)
], InvoiceResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500 }),
    __metadata("design:type", Number)
], InvoiceResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PENDING', 'PAID', 'OVERDUE'] }),
    __metadata("design:type", String)
], InvoiceResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-31' }),
    __metadata("design:type", Date)
], InvoiceResponseDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], InvoiceResponseDto.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], InvoiceResponseDto.prototype, "exportFields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], InvoiceResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], InvoiceResponseDto.prototype, "updatedAt", void 0);
class PaginatedInvoiceResponseDto {
    data;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedInvoiceResponseDto = PaginatedInvoiceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InvoiceResponseDto], description: 'List of invoices' }),
    __metadata("design:type", Array)
], PaginatedInvoiceResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42, description: 'Total count' }),
    __metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Current page' }),
    __metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Items per page' }),
    __metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Total pages' }),
    __metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=invoice-response.dto.js.map