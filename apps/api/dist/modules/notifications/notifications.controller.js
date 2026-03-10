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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const notification_response_dto_1 = require("./dto/notification-response.dto");
let NotificationsController = class NotificationsController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    findAll(user, pagination, read) {
        const filter = read !== undefined ? { read: read === 'true' } : undefined;
        return this.notificationService.findAllForUser(user.sub, pagination, filter);
    }
    getUnreadCount(user) {
        return this.notificationService.getUnreadCount(user.sub);
    }
    markAllAsRead(user) {
        return this.notificationService.markAllAsRead(user.sub);
    }
    clearAll(user) {
        return this.notificationService.deleteAll(user.sub);
    }
    deleteOne(id, user) {
        return this.notificationService.deleteOne(id, user.sub);
    }
    markAsRead(id, user) {
        return this.notificationService.markAsRead(id, user.sub);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List notifications for current user' }),
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
        name: 'read',
        required: false,
        type: Boolean,
        description: 'Filter by read status (true/false)',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Paginated list of notifications for the authenticated user',
        type: notification_response_dto_1.PaginatedNotificationsResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('read')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notification count' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Unread notification count (e.g. for badge)',
        type: notification_response_dto_1.UnreadCountResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Number of notifications marked as read',
        type: notification_response_dto_1.MarkAllReadResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)('clear-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all notifications for current user' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Number of notifications deleted',
        type: notification_response_dto_1.ClearAllResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "clearAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Clear a single notification' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Notification deleted' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found or does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid notification ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "deleteOne", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark a notification as read' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'The notification marked as read',
        type: notification_response_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid or missing JWT' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found or does not belong to user' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid notification ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAsRead", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map