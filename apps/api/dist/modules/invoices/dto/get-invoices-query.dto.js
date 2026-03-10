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
exports.GetInvoicesQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
const shared_types_1 = require("@grow-fitness/shared-types");
class GetInvoicesQueryDto extends pagination_dto_1.PaginationDto {
    type;
    parentId;
    coachId;
    status;
}
exports.GetInvoicesQueryDto = GetInvoicesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_types_1.InvoiceType, description: 'Filter by invoice type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.InvoiceType),
    __metadata("design:type", String)
], GetInvoicesQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by parent ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetInvoicesQueryDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by coach ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetInvoicesQueryDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: shared_types_1.InvoiceStatus, description: 'Filter by invoice status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_types_1.InvoiceStatus),
    __metadata("design:type", String)
], GetInvoicesQueryDto.prototype, "status", void 0);
//# sourceMappingURL=get-invoices-query.dto.js.map