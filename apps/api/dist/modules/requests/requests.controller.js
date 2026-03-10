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
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const requests_service_1 = require("./requests.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const shared_types_1 = require("@grow-fitness/shared-types");
const shared_schemas_1 = require("@grow-fitness/shared-schemas");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
let RequestsController = class RequestsController {
    requestsService;
    constructor(requestsService) {
        this.requestsService = requestsService;
    }
    createFreeSessionRequest(createDto) {
        return this.requestsService.createFreeSessionRequest(createDto);
    }
    findFreeSessionRequests(pagination) {
        return this.requestsService.findFreeSessionRequests(pagination);
    }
    selectFreeSessionRequest(id, sessionId, actorId) {
        return this.requestsService.selectFreeSessionRequest(id, actorId, sessionId);
    }
    updateFreeSessionRequest(id, updateData, actorId) {
        return this.requestsService.updateFreeSessionRequest(id, updateData, actorId);
    }
    deleteFreeSessionRequest(id, actorId) {
        return this.requestsService.deleteFreeSessionRequest(id, actorId);
    }
    createRescheduleRequest(createDto, requestedById) {
        return this.requestsService.createRescheduleRequest(createDto, requestedById);
    }
    createExtraSessionRequest(createDto, actorId, actorRole) {
        return this.requestsService.createExtraSessionRequest(createDto, actorId, actorRole);
    }
    findRescheduleRequests(pagination) {
        return this.requestsService.findRescheduleRequests(pagination);
    }
    approveRescheduleRequest(id, actorId) {
        return this.requestsService.approveRescheduleRequest(id, actorId);
    }
    denyRescheduleRequest(id, actorId) {
        return this.requestsService.denyRescheduleRequest(id, actorId);
    }
    updateRescheduleRequest(id, updateData, actorId) {
        return this.requestsService.updateRescheduleRequest(id, {
            ...updateData,
            newDateTime: updateData.newDateTime ? new Date(updateData.newDateTime) : undefined,
        }, actorId);
    }
    deleteRescheduleRequest(id, actorId) {
        return this.requestsService.deleteRescheduleRequest(id, actorId);
    }
    findExtraSessionRequests(pagination) {
        return this.requestsService.findExtraSessionRequests(pagination);
    }
    approveExtraSessionRequest(id, actorId) {
        return this.requestsService.approveExtraSessionRequest(id, actorId);
    }
    denyExtraSessionRequest(id, actorId) {
        return this.requestsService.denyExtraSessionRequest(id, actorId);
    }
    updateExtraSessionRequest(id, updateData, actorId) {
        return this.requestsService.updateExtraSessionRequest(id, {
            ...updateData,
            preferredDateTime: updateData.preferredDateTime
                ? new Date(updateData.preferredDateTime)
                : undefined,
        }, actorId);
    }
    deleteExtraSessionRequest(id, actorId) {
        return this.requestsService.deleteExtraSessionRequest(id, actorId);
    }
    findUserRegistrationRequests(pagination) {
        return this.requestsService.findUserRegistrationRequests(pagination);
    }
    approveUserRegistrationRequest(id, actorId) {
        return this.requestsService.approveUserRegistrationRequest(id, actorId);
    }
    rejectUserRegistrationRequest(id, actorId) {
        return this.requestsService.rejectUserRegistrationRequest(id, actorId);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Post)('free-sessions'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a free session request' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                parentName: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '1234567890' },
                email: { type: 'string', example: 'john@example.com' },
                kidName: { type: 'string', example: 'Jane Doe' },
                sessionType: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'] },
                selectedSessionId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                locationId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                preferredDateTime: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Free session request created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "createFreeSessionRequest", null);
__decorate([
    (0, common_1.Get)('free-sessions'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all free session requests' }),
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
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of free session requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findFreeSessionRequests", null);
__decorate([
    (0, common_1.Post)('free-sessions/:id/select'),
    (0, swagger_1.ApiOperation)({ summary: 'Select a free session request' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'Session ID to select (optional)',
                    example: '507f1f77bcf86cd799439011',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Free session request selected successfully' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)('sessionId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "selectFreeSessionRequest", null);
__decorate([
    (0, common_1.Patch)('free-sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a free session request' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['PENDING', 'SELECTED', 'DENIED'],
                    description: 'Request status',
                },
                selectedSessionId: { type: 'string', description: 'Selected session ID' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Free session request updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "updateFreeSessionRequest", null);
__decorate([
    (0, common_1.Delete)('free-sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a free session request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Free session request deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "deleteFreeSessionRequest", null);
__decorate([
    (0, common_1.Post)('reschedules'),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN, shared_types_1.UserRole.PARENT, shared_types_1.UserRole.COACH),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a reschedule request',
        description: 'Requires JWT. Allowed roles: Admin, Parent, Coach. requestedBy is set from token.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                sessionId: {
                    type: 'string',
                    description: 'Session ID to reschedule',
                    example: '507f1f77bcf86cd799439011',
                },
                newDateTime: {
                    type: 'string',
                    format: 'date-time',
                    description: 'New date and time (ISO format)',
                },
                reason: { type: 'string', description: 'Reason for reschedule' },
            },
            required: ['sessionId', 'newDateTime', 'reason'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reschedule request created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - valid JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.CreateRescheduleRequestSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "createRescheduleRequest", null);
__decorate([
    (0, common_1.Post)('extra-sessions'),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN, shared_types_1.UserRole.PARENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an extra session request',
        description: 'Requires JWT. Allowed roles: Admin, Parent. Parent creates for own kids; Admin provides parentId in body.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                parentId: {
                    type: 'string',
                    description: 'Parent ID (required for admin; ignored when caller is parent)',
                    example: '507f1f77bcf86cd799439011',
                },
                kidId: { type: 'string', description: 'Kid ID', example: '507f1f77bcf86cd799439011' },
                coachId: { type: 'string', description: 'Coach ID', example: '507f1f77bcf86cd799439011' },
                sessionType: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'] },
                locationId: {
                    type: 'string',
                    description: 'Location ID',
                    example: '507f1f77bcf86cd799439011',
                },
                preferredDateTime: { type: 'string', format: 'date-time' },
            },
            required: ['kidId', 'coachId', 'sessionType', 'locationId', 'preferredDateTime'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Extra session request created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - valid JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Kid not found or does not belong to parent' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.CreateExtraSessionRequestSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "createExtraSessionRequest", null);
__decorate([
    (0, common_1.Get)('reschedules'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reschedule requests' }),
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
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of reschedule requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findRescheduleRequests", null);
__decorate([
    (0, common_1.Post)('reschedules/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a reschedule request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reschedule request approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "approveRescheduleRequest", null);
__decorate([
    (0, common_1.Post)('reschedules/:id/deny'),
    (0, swagger_1.ApiOperation)({ summary: 'Deny a reschedule request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reschedule request denied successfully' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "denyRescheduleRequest", null);
__decorate([
    (0, common_1.Patch)('reschedules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a reschedule request' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['PENDING', 'APPROVED', 'DENIED'],
                    description: 'Request status',
                },
                newDateTime: {
                    type: 'string',
                    format: 'date-time',
                    description: 'New date and time (ISO format)',
                },
                reason: { type: 'string', description: 'Reason for reschedule' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reschedule request updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "updateRescheduleRequest", null);
__decorate([
    (0, common_1.Delete)('reschedules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a reschedule request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reschedule request deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "deleteRescheduleRequest", null);
__decorate([
    (0, common_1.Get)('extra-sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all extra session requests' }),
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
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of extra session requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findExtraSessionRequests", null);
__decorate([
    (0, common_1.Post)('extra-sessions/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve an extra session request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Extra session request approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "approveExtraSessionRequest", null);
__decorate([
    (0, common_1.Post)('extra-sessions/:id/deny'),
    (0, swagger_1.ApiOperation)({ summary: 'Deny an extra session request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Extra session request denied successfully' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "denyExtraSessionRequest", null);
__decorate([
    (0, common_1.Patch)('extra-sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an extra session request' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['PENDING', 'APPROVED', 'DENIED'],
                    description: 'Request status',
                },
                preferredDateTime: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Preferred date and time (ISO format)',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Extra session request updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "updateExtraSessionRequest", null);
__decorate([
    (0, common_1.Delete)('extra-sessions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an extra session request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Extra session request deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "deleteExtraSessionRequest", null);
__decorate([
    (0, common_1.Get)('user-registrations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user registration requests' }),
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
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of user registration requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findUserRegistrationRequests", null);
__decorate([
    (0, common_1.Post)('user-registrations/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a user registration request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User registration request approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "approveUserRegistrationRequest", null);
__decorate([
    (0, common_1.Post)('user-registrations/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a user registration request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User registration request rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "rejectUserRegistrationRequest", null);
exports.RequestsController = RequestsController = __decorate([
    (0, swagger_1.ApiTags)('requests'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [requests_service_1.RequestsService])
], RequestsController);
//# sourceMappingURL=requests.controller.js.map