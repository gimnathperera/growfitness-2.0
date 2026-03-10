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
exports.GoogleCalendarStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const google_calendar_oauth_service_1 = require("./google-calendar-oauth.service");
let GoogleCalendarStatusController = class GoogleCalendarStatusController {
    googleCalendarOAuth;
    constructor(googleCalendarOAuth) {
        this.googleCalendarOAuth = googleCalendarOAuth;
    }
    async status(userId) {
        const connected = await this.googleCalendarOAuth.isConnected(userId);
        return { connected };
    }
};
exports.GoogleCalendarStatusController = GoogleCalendarStatusController;
__decorate([
    (0, common_1.Get)('calendar-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google Calendar connection status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connection status' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoogleCalendarStatusController.prototype, "status", null);
exports.GoogleCalendarStatusController = GoogleCalendarStatusController = __decorate([
    (0, swagger_1.ApiTags)('google-calendar'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('users/me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [google_calendar_oauth_service_1.GoogleCalendarOAuthService])
], GoogleCalendarStatusController);
//# sourceMappingURL=google-calendar-status.controller.js.map