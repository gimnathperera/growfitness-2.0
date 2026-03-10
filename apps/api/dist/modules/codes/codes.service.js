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
exports.CodesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const code_schema_1 = require("../../infra/database/schemas/code.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let CodesService = class CodesService {
    codeModel;
    auditService;
    constructor(codeModel, auditService) {
        this.codeModel = codeModel;
        this.auditService = auditService;
    }
    async findAll(pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.codeModel.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
            this.codeModel.countDocuments().exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const code = await this.codeModel.findById(id).exec();
        if (!code) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.CODE_NOT_FOUND,
                message: 'Code not found',
            });
        }
        return code;
    }
    async create(createCodeDto, actorId) {
        if (createCodeDto.type === 'DISCOUNT' &&
            !createCodeDto.discountPercentage &&
            !createCodeDto.discountAmount) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                message: 'Discount percentage or amount is required for discount codes',
            });
        }
        const code = new this.codeModel({
            ...createCodeDto,
            code: createCodeDto.code.toUpperCase(),
            status: 'ACTIVE',
            usageCount: 0,
        });
        await code.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_CODE',
            entityType: 'Code',
            entityId: code._id.toString(),
            metadata: createCodeDto,
        });
        return code;
    }
    async update(id, updateCodeDto, actorId) {
        const code = await this.codeModel.findById(id).exec();
        if (!code) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.CODE_NOT_FOUND,
                message: 'Code not found',
            });
        }
        if (code.expiryDate && new Date() > code.expiryDate) {
            updateCodeDto.status = 'EXPIRED';
        }
        Object.assign(code, updateCodeDto);
        await code.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_CODE',
            entityType: 'Code',
            entityId: id,
            metadata: updateCodeDto,
        });
        return code;
    }
    async delete(id, actorId) {
        const code = await this.codeModel.findById(id).exec();
        if (!code) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.CODE_NOT_FOUND,
                message: 'Code not found',
            });
        }
        await this.codeModel.deleteOne({ _id: id }).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_CODE',
            entityType: 'Code',
            entityId: id,
        });
        return { message: 'Code deleted successfully' };
    }
};
exports.CodesService = CodesService;
exports.CodesService = CodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(code_schema_1.Code.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], CodesService);
//# sourceMappingURL=codes.service.js.map