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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sessions_service_1 = require("./sessions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const get_sessions_query_dto_1 = require("./dto/get-sessions-query.dto");
const session_response_dto_1 = require("./dto/session-response.dto");
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    findAll(query) {
        const { page, limit, search, coachId, locationId, kidId, status, startDate, endDate } = query;
        return this.sessionsService.findAll({ page, limit, search }, {
            coachId,
            locationId,
            kidId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }
    findFreeSessions(query) {
        const { page, limit, search, coachId, locationId, kidId, status, startDate, endDate } = query;
        return this.sessionsService.findAll({ page, limit, search }, {
            coachId,
            locationId,
            kidId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            isFreeSession: true,
        });
    }
    findById(id) {
        return this.sessionsService.findById(id);
    }
    create(createSessionDto, actorId) {
        return this.sessionsService.create(createSessionDto, actorId);
    }
    update(id, updateSessionDto, actorId) {
        return this.sessionsService.update(id, updateSessionDto, actorId);
    }
    delete(id, actorId) {
        return this.sessionsService.delete(id, actorId);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sessions' }),
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
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search string' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'locationId',
        required: false,
        type: String,
        description: 'Filter by location ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'kidId',
        required: false,
        type: String,
        description: 'Filter by kid ID (sessions that include this kid)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: shared_types_1.SessionStatus,
        description: 'Filter by session status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Filter sessions from this date (ISO format)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Filter sessions until this date (ISO format)',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of sessions. Each session includes coachId/locationId as IDs and optional coach/location when expanded.',
        type: session_response_dto_1.PaginatedSessionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (e.g. invalid query params)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_sessions_query_dto_1.GetSessionsQueryDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('free'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get free sessions (public)',
        description: 'Public endpoint. No auth required. Returns sessions where isFreeSession is true. Same filters as GET /sessions.',
    }),
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
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search string' }),
    (0, swagger_1.ApiQuery)({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'locationId',
        required: false,
        type: String,
        description: 'Filter by location ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'kidId',
        required: false,
        type: String,
        description: 'Filter by kid ID (sessions that include this kid)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        enum: shared_types_1.SessionStatus,
        description: 'Filter by session status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        type: String,
        description: 'Filter sessions from this date (ISO format)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        type: String,
        description: 'Filter sessions until this date (ISO format)',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of free sessions (isFreeSession: true). Same filters as GET /sessions.',
        type: session_response_dto_1.PaginatedSessionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error (e.g. invalid query params)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_sessions_query_dto_1.GetSessionsQueryDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findFreeSessions", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get session by ID' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Session details with optional coach/location populated.',
        type: session_response_dto_1.SessionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new session' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Session title/name',
                    example: 'Morning Training Session',
                },
                type: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'], description: 'Session type' },
                coachId: { type: 'string', description: 'Coach ID', example: '507f1f77bcf86cd799439011' },
                locationId: {
                    type: 'string',
                    description: 'Location ID',
                    example: '507f1f77bcf86cd799439011',
                },
                dateTime: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Session date and time (ISO format)',
                },
                duration: { type: 'number', description: 'Duration in minutes', example: 60, minimum: 1 },
                capacity: {
                    type: 'number',
                    description: 'Maximum capacity (for group sessions)',
                    example: 10,
                    minimum: 1,
                },
                kids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of kid IDs (exactly one for individual sessions)',
                },
                isFreeSession: {
                    type: 'boolean',
                    description: 'Whether this is a free session',
                    default: false,
                },
            },
            required: ['title', 'type', 'coachId', 'locationId', 'dateTime', 'duration', 'kids'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Session created successfully. Returns session with optional coach/location populated.',
        type: session_response_dto_1.SessionResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a session' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'Session title/name',
                    example: 'Morning Training Session',
                },
                coachId: { type: 'string', description: 'Coach ID', example: '507f1f77bcf86cd799439011' },
                locationId: {
                    type: 'string',
                    description: 'Location ID',
                    example: '507f1f77bcf86cd799439011',
                },
                dateTime: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Session date and time (ISO format)',
                    example: '2024-12-15T10:00:00.000Z',
                },
                duration: { type: 'number', description: 'Duration in minutes', example: 60, minimum: 1 },
                capacity: { type: 'number', description: 'Maximum capacity', example: 10, minimum: 1 },
                kids: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of kid IDs (exactly one for individual sessions)',
                    example: ['507f1f77bcf86cd799439011'],
                },
                kidId: {
                    type: 'string',
                    description: 'Kid ID (for individual sessions, alternative to kids array)',
                    example: '507f1f77bcf86cd799439011',
                },
                status: {
                    type: 'string',
                    enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
                    description: 'Session status',
                    example: 'SCHEDULED',
                },
                isFreeSession: {
                    type: 'boolean',
                    description: 'Whether this is a free session',
                    example: false,
                },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Session updated. Returns session with optional coach/location populated.',
        type: session_response_dto_1.SessionResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Session not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "delete", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map