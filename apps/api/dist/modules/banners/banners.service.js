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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banner_schema_1 = require("../../infra/database/schemas/banner.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let BannersService = class BannersService {
    bannerModel;
    auditService;
    constructor(bannerModel, auditService) {
        this.bannerModel = bannerModel;
        this.auditService = auditService;
    }
    async findAll(pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.bannerModel.find().sort({ order: 1 }).skip(skip).limit(pagination.limit).exec(),
            this.bannerModel.countDocuments().exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.BANNER_NOT_FOUND,
                message: 'Banner not found',
            });
        }
        return banner;
    }
    async create(createBannerDto, actorId) {
        const banner = new this.bannerModel(createBannerDto);
        await banner.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_BANNER',
            entityType: 'Banner',
            entityId: banner._id.toString(),
            metadata: createBannerDto,
        });
        return banner;
    }
    async update(id, updateBannerDto, actorId) {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.BANNER_NOT_FOUND,
                message: 'Banner not found',
            });
        }
        Object.assign(banner, updateBannerDto);
        await banner.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_BANNER',
            entityType: 'Banner',
            entityId: id,
            metadata: updateBannerDto,
        });
        return banner;
    }
    async delete(id, actorId) {
        const banner = await this.bannerModel.findById(id).exec();
        if (!banner) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.BANNER_NOT_FOUND,
                message: 'Banner not found',
            });
        }
        await this.bannerModel.deleteOne({ _id: id }).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_BANNER',
            entityType: 'Banner',
            entityId: id,
        });
        return { message: 'Banner deleted successfully' };
    }
    async reorder(reorderDto, actorId) {
        const updates = reorderDto.bannerIds.map((bannerId, index) => ({
            updateOne: {
                filter: { _id: new mongoose_2.Types.ObjectId(bannerId) },
                update: { $set: { order: index } },
            },
        }));
        await this.bannerModel.bulkWrite(updates);
        await this.auditService.log({
            actorId,
            action: 'REORDER_BANNERS',
            entityType: 'Banner',
            entityId: 'multiple',
            metadata: reorderDto,
        });
        return { message: 'Banners reordered successfully' };
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(banner_schema_1.Banner.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], BannersService);
//# sourceMappingURL=banners.service.js.map