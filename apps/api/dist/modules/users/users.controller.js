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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const get_parents_query_dto_1 = require("./dto/get-parents-query.dto");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findParents(query) {
        return this.usersService.findParents(query, query.search, query.location, query.status);
    }
    findParentById(id, includeUnapproved) {
        return this.usersService.findParentById(id, includeUnapproved === 'true');
    }
    createParent(createParentDto, user) {
        const actorId = user?.sub || user?.id || null;
        return this.usersService.createParent(createParentDto, actorId);
    }
    updateParent(id, updateParentDto, actorId) {
        return this.usersService.updateParent(id, updateParentDto, actorId);
    }
    deleteParent(id, actorId) {
        return this.usersService.deleteParent(id, actorId);
    }
    findCoaches(pagination, search) {
        return this.usersService.findCoaches(pagination, search);
    }
    findCoachById(id) {
        return this.usersService.findCoachById(id);
    }
    createCoach(createCoachDto, actorId) {
        return this.usersService.createCoach(createCoachDto, actorId);
    }
    updateCoach(id, updateCoachDto, actorId) {
        return this.usersService.updateCoach(id, updateCoachDto, actorId);
    }
    deactivateCoach(id, actorId) {
        return this.usersService.deactivateCoach(id, actorId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('parents'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all parents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of parents' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_parents_query_dto_1.GetParentsQueryDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findParents", null);
__decorate([
    (0, common_1.Get)('parents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get parent by ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'includeUnapproved',
        required: false,
        type: Boolean,
        description: 'Include unapproved parents (admin only)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parent details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Query)('includeUnapproved')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findParentById", null);
__decorate([
    (0, common_1.Post)('parents'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new parent' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                phone: { type: 'string' },
                location: { type: 'string' },
                password: { type: 'string', minLength: 6 },
                kids: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            gender: { type: 'string' },
                            birthDate: { type: 'string', format: 'date' },
                            goal: { type: 'string' },
                            currentlyInSports: { type: 'boolean' },
                            medicalConditions: { type: 'array', items: { type: 'string' } },
                            sessionType: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'] },
                        },
                    },
                },
            },
            required: ['name', 'email', 'phone', 'password', 'kids'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Parent created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createParent", null);
__decorate([
    (0, common_1.Patch)('parents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update parent' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Parent full name' },
                email: { type: 'string', format: 'email', description: 'Parent email address' },
                phone: { type: 'string', description: 'Parent phone number' },
                location: { type: 'string', description: 'Parent location' },
                status: {
                    type: 'string',
                    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
                    description: 'Parent status',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parent updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateParent", null);
__decorate([
    (0, common_1.Delete)('parents/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete parent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Parent deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteParent", null);
__decorate([
    (0, common_1.Get)('coaches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all coaches' }),
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
    (0, swagger_1.ApiQuery)({
        name: 'search',
        required: false,
        type: String,
        description: 'Search by email, phone, or name',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of coaches' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findCoaches", null);
__decorate([
    (0, common_1.Get)('coaches/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coach by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coach details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coach not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findCoachById", null);
__decorate([
    (0, common_1.Post)('coaches'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coach' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Coach full name', example: 'John Doe' },
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'Coach email address',
                    example: 'john.doe@example.com',
                },
                phone: { type: 'string', description: 'Coach phone number', example: '+1234567890' },
                password: {
                    type: 'string',
                    minLength: 6,
                    description: 'Password (minimum 6 characters)',
                    example: 'password123',
                },
            },
            required: ['name', 'email', 'phone', 'password'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Coach created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email already exists' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "createCoach", null);
__decorate([
    (0, common_1.Patch)('coaches/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update coach' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Coach full name' },
                email: { type: 'string', format: 'email', description: 'Coach email address' },
                phone: { type: 'string', description: 'Coach phone number' },
                status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Coach status' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coach updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coach not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateCoach", null);
__decorate([
    (0, common_1.Delete)('coaches/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate coach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Coach deactivated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Coach not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivateCoach", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map