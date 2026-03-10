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
exports.PaginatedNotificationsResponseDto = exports.ClearAllResponseDto = exports.MarkAllReadResponseDto = exports.UnreadCountResponseDto = exports.NotificationResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const shared_types_1 = require("@grow-fitness/shared-types");
class NotificationResponseDto {
    id;
    userId;
    type;
    title;
    body;
    read;
    entityType;
    entityId;
    createdAt;
}
exports.NotificationResponseDto = NotificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification ID' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient user ID' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: shared_types_1.NotificationType, description: 'Notification type' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Short title' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification body' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the notification has been read' }),
    __metadata("design:type", Boolean)
], NotificationResponseDto.prototype, "read", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Related entity type (e.g. Session, RescheduleRequest)' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Related entity ID' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "createdAt", void 0);
class UnreadCountResponseDto {
    count;
}
exports.UnreadCountResponseDto = UnreadCountResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of unread notifications', example: 5 }),
    __metadata("design:type", Number)
], UnreadCountResponseDto.prototype, "count", void 0);
class MarkAllReadResponseDto {
    count;
}
exports.MarkAllReadResponseDto = MarkAllReadResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of notifications marked as read', example: 3 }),
    __metadata("design:type", Number)
], MarkAllReadResponseDto.prototype, "count", void 0);
class ClearAllResponseDto {
    deletedCount;
}
exports.ClearAllResponseDto = ClearAllResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of notifications deleted', example: 5 }),
    __metadata("design:type", Number)
], ClearAllResponseDto.prototype, "deletedCount", void 0);
class PaginatedNotificationsResponseDto {
    data;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedNotificationsResponseDto = PaginatedNotificationsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [NotificationResponseDto], description: 'List of notifications' }),
    __metadata("design:type", Array)
], PaginatedNotificationsResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total number of items' }),
    __metadata("design:type", Number)
], PaginatedNotificationsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current page' }),
    __metadata("design:type", Number)
], PaginatedNotificationsResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items per page' }),
    __metadata("design:type", Number)
], PaginatedNotificationsResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total pages' }),
    __metadata("design:type", Number)
], PaginatedNotificationsResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=notification-response.dto.js.map