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
exports.BannersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const banners_service_1 = require("./banners.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const shared_schemas_1 = require("@grow-fitness/shared-schemas");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
let BannersController = class BannersController {
    bannersService;
    constructor(bannersService) {
        this.bannersService = bannersService;
    }
    findAll(pagination) {
        return this.bannersService.findAll(pagination);
    }
    findById(id) {
        return this.bannersService.findById(id);
    }
    create(createBannerDto, actorId) {
        return this.bannersService.create(createBannerDto, actorId);
    }
    update(id, updateBannerDto, actorId) {
        return this.bannersService.update(id, updateBannerDto, actorId);
    }
    delete(id, actorId) {
        return this.bannersService.delete(id, actorId);
    }
    reorder(reorderDto, actorId) {
        return this.bannersService.reorder(reorderDto, actorId);
    }
};
exports.BannersController = BannersController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all banners' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10, max: 100)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of banners' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get banner by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Banner not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new banner' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                imageUrl: {
                    type: 'string',
                    format: 'uri',
                    description: 'Banner image URL',
                    example: 'https://example.com/banner.jpg',
                },
                active: { type: 'boolean', description: 'Whether the banner is active', default: true },
                order: {
                    type: 'number',
                    description: 'Display order (lower numbers appear first)',
                    example: 0,
                    minimum: 0,
                },
                targetAudience: {
                    type: 'string',
                    enum: ['PARENT', 'COACH', 'ALL'],
                    description: 'Target audience for the banner',
                },
            },
            required: ['imageUrl', 'order', 'targetAudience'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Banner created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.CreateBannerSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a banner' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                imageUrl: { type: 'string', format: 'uri', description: 'Banner image URL' },
                active: { type: 'boolean', description: 'Whether the banner is active' },
                order: { type: 'number', description: 'Display order', minimum: 0 },
                targetAudience: {
                    type: 'string',
                    enum: ['PARENT', 'COACH', 'ALL'],
                    description: 'Target audience',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Banner not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format or validation error' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.UpdateBannerSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a banner' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banner deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Banner not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder banners' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                bannerIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of banner IDs in the desired order',
                    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
                },
            },
            required: ['bannerIds'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Banners reordered successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BannersController.prototype, "reorder", null);
exports.BannersController = BannersController = __decorate([
    (0, swagger_1.ApiTags)('banners'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('banners'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [banners_service_1.BannersService])
], BannersController);
//# sourceMappingURL=banners.controller.js.map