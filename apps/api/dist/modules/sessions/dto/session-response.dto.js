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
exports.PaginatedSessionResponseDto = exports.SessionResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SessionCoachRefDto {
    id;
    email;
    coachProfile;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], SessionCoachRefDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'coach@example.com' }),
    __metadata("design:type", String)
], SessionCoachRefDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Coach profile', example: { name: 'Jane' } }),
    __metadata("design:type", Object)
], SessionCoachRefDto.prototype, "coachProfile", void 0);
class SessionLocationRefDto {
    id;
    name;
    address;
    geo;
    isActive;
    placeUrl;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], SessionLocationRefDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Main Gym' }),
    __metadata("design:type", String)
], SessionLocationRefDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Fitness St' }),
    __metadata("design:type", String)
], SessionLocationRefDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { lat: 40.7, lng: -74 } }),
    __metadata("design:type", Object)
], SessionLocationRefDto.prototype, "geo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], SessionLocationRefDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Link to map or place page',
        example: 'https://maps.google.com/...',
    }),
    __metadata("design:type", String)
], SessionLocationRefDto.prototype, "placeUrl", void 0);
class SessionResponseDto {
    id;
    title;
    type;
    coachId;
    locationId;
    coach;
    location;
    dateTime;
    duration;
    capacity;
    kids;
    status;
    isFreeSession;
    createdAt;
    updatedAt;
}
exports.SessionResponseDto = SessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Morning Training Session', description: 'Session title/name' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['INDIVIDUAL', 'GROUP'] }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coach user ID' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "coachId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location ID' }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated when coachId is expanded' }),
    __metadata("design:type", SessionCoachRefDto)
], SessionResponseDto.prototype, "coach", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Populated when locationId is expanded' }),
    __metadata("design:type", SessionLocationRefDto)
], SessionResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-15T10:00:00.000Z' }),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "dateTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 60, description: 'Duration in minutes' }),
    __metadata("design:type", Number)
], SessionResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    __metadata("design:type", Number)
], SessionResponseDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Kid IDs' }),
    __metadata("design:type", Array)
], SessionResponseDto.prototype, "kids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] }),
    __metadata("design:type", String)
], SessionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], SessionResponseDto.prototype, "isFreeSession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SessionResponseDto.prototype, "updatedAt", void 0);
class PaginatedSessionResponseDto {
    data;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedSessionResponseDto = PaginatedSessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SessionResponseDto], description: 'List of sessions' }),
    __metadata("design:type", Array)
], PaginatedSessionResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 42, description: 'Total count' }),
    __metadata("design:type", Number)
], PaginatedSessionResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Current page' }),
    __metadata("design:type", Number)
], PaginatedSessionResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'Items per page' }),
    __metadata("design:type", Number)
], PaginatedSessionResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Total pages' }),
    __metadata("design:type", Number)
], PaginatedSessionResponseDto.prototype, "totalPages", void 0);
//# sourceMappingURL=session-response.dto.js.map