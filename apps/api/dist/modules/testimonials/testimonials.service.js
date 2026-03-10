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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const testimonial_schema_1 = require("../../infra/database/schemas/testimonial.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let TestimonialsService = class TestimonialsService {
    testimonialModel;
    auditService;
    constructor(testimonialModel, auditService) {
        this.testimonialModel = testimonialModel;
        this.auditService = auditService;
    }
    async findAll(pagination, activeOnly = false) {
        const query = activeOnly ? { isActive: true } : {};
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.testimonialModel
                .find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean()
                .exec(),
            this.testimonialModel.countDocuments(query).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const testimonial = await this.testimonialModel.findById(id).lean().exec();
        if (!testimonial) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Testimonial not found',
            });
        }
        return testimonial;
    }
    async create(createDto, actorId) {
        const testimonial = new this.testimonialModel({
            ...createDto,
            order: createDto.order ?? 0,
            rating: createDto.rating ?? 5,
            isActive: createDto.isActive ?? true,
        });
        await testimonial.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_TESTIMONIAL',
            entityType: 'Testimonial',
            entityId: testimonial._id.toString(),
            metadata: createDto,
        });
        return this.findById(testimonial._id.toString());
    }
    async update(id, updateDto, actorId) {
        const testimonial = await this.testimonialModel.findById(id).exec();
        if (!testimonial) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Testimonial not found',
            });
        }
        Object.assign(testimonial, updateDto);
        await testimonial.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_TESTIMONIAL',
            entityType: 'Testimonial',
            entityId: id,
            metadata: updateDto,
        });
        return this.findById(id);
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(testimonial_schema_1.Testimonial.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map