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
exports.KidsController = void 0;
const common_1 = require("@nestjs/common");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const swagger_1 = require("@nestjs/swagger");
const kids_service_1 = require("./kids.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const find_kids_query_dto_1 = require("./dto/find-kids-query.dto");
let KidsController = class KidsController {
    kidsService;
    constructor(kidsService) {
        this.kidsService = kidsService;
    }
    findAll(query) {
        const { parentId, sessionType, search, ...pagination } = query;
        return this.kidsService.findAll(pagination, parentId, sessionType, search);
    }
    create(createKidDto, actorId) {
        return this.kidsService.create(createKidDto, actorId);
    }
    findById(id) {
        return this.kidsService.findById(id);
    }
    update(id, updateKidDto, actorId) {
        return this.kidsService.update(id, updateKidDto, actorId);
    }
    linkToParent(kidId, parentId, actorId) {
        return this.kidsService.linkToParent(kidId, parentId, actorId);
    }
    unlinkFromParent(kidId, actorId) {
        return this.kidsService.unlinkFromParent(kidId, actorId);
    }
};
exports.KidsController = KidsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all kids' }),
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
    (0, swagger_1.ApiQuery)({ name: 'parentId', required: false, type: String, description: 'Filter by parent ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'sessionType',
        required: false,
        enum: ['INDIVIDUAL', 'GROUP'],
        description: 'Filter by session type',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search by name or goal',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of kids' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_kids_query_dto_1.FindKidsQueryDto]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new kid' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Kid full name', example: 'Emma Smith' },
                gender: { type: 'string', description: 'Kid gender', example: 'Female' },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Birth date (ISO format)',
                    example: '2015-05-15',
                },
                goal: {
                    type: 'string',
                    description: 'Fitness goal (optional)',
                    example: 'Improve flexibility and strength',
                },
                currentlyInSports: {
                    type: 'boolean',
                    description: 'Whether kid is currently in sports',
                    example: true,
                },
                medicalConditions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of medical conditions (optional)',
                    example: ['Asthma'],
                },
                sessionType: {
                    type: 'string',
                    enum: ['INDIVIDUAL', 'GROUP'],
                    description: 'Preferred session type',
                    example: 'INDIVIDUAL',
                },
                parentId: {
                    type: 'string',
                    description: 'Parent ID (MongoDB ObjectId)',
                    example: '507f1f77bcf86cd799439011',
                },
            },
            required: ['name', 'gender', 'birthDate', 'currentlyInSports', 'sessionType', 'parentId'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Kid created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get kid by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kid details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kid not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a kid' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Kid full name' },
                gender: { type: 'string', description: 'Kid gender' },
                birthDate: {
                    type: 'string',
                    format: 'date',
                    description: 'Birth date (ISO format)',
                },
                goal: {
                    type: 'string',
                    description: 'Fitness goal',
                },
                currentlyInSports: {
                    type: 'boolean',
                    description: 'Whether kid is currently in sports',
                },
                medicalConditions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of medical conditions',
                },
                sessionType: {
                    type: 'string',
                    enum: ['INDIVIDUAL', 'GROUP'],
                    description: 'Preferred session type',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kid updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kid not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/link-parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Link kid to parent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kid linked to parent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)('parentId', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "linkToParent", null);
__decorate([
    (0, common_1.Delete)(':id/unlink-parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Unlink kid from parent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Kid unlinked from parent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KidsController.prototype, "unlinkFromParent", null);
exports.KidsController = KidsController = __decorate([
    (0, swagger_1.ApiTags)('kids'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('kids'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [kids_service_1.KidsService])
], KidsController);
//# sourceMappingURL=kids.controller.js.map