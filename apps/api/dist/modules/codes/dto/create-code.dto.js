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
exports.CreateCodeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCodeDto {
    code;
    type;
    discountPercentage;
    discountAmount;
    expiryDate;
    usageLimit;
    description;
}
exports.CreateCodeDto = CreateCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The code string (will be converted to uppercase)',
        example: 'SUMMER2024',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCodeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of code',
        example: 'DISCOUNT',
        enum: ['DISCOUNT', 'PROMOTION'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCodeDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount percentage (required if type is DISCOUNT and discountAmount is not provided)',
        example: 10,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCodeDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount amount (required if type is DISCOUNT and discountPercentage is not provided)',
        example: 50,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCodeDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expiry date of the code',
        example: '2024-12-31T23:59:59Z',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateCodeDto.prototype, "expiryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum number of times this code can be used',
        example: 100,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCodeDto.prototype, "usageLimit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the code',
        example: 'Summer promotion code',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCodeDto.prototype, "description", void 0);
//# sourceMappingURL=create-code.dto.js.map