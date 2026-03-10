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
exports.GoogleCalendarAuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const google_calendar_oauth_service_1 = require("./google-calendar-oauth.service");
const google_oauth_state_service_1 = require("./google-oauth-state.service");
let GoogleCalendarAuthController = class GoogleCalendarAuthController {
    googleCalendarOAuth;
    stateService;
    constructor(googleCalendarOAuth, stateService) {
        this.googleCalendarOAuth = googleCalendarOAuth;
        this.stateService = stateService;
    }
    async getAuthUrl(userId, redirectUri) {
        const url = await this.googleCalendarOAuth.buildAuthUrl(userId, redirectUri);
        return { url };
    }
    async callback(code, state, res) {
        try {
            const { redirectUri } = await this.googleCalendarOAuth.handleCallback(code, state);
            const url = new URL(redirectUri);
            url.searchParams.set('connected', '1');
            return res.redirect(url.toString());
        }
        catch (e) {
            try {
                const payload = this.stateService.verify(state);
                const url = new URL(payload.redirectUri);
                url.searchParams.set('connected', '0');
                url.searchParams.set('error', 'oauth_failed');
                return res.redirect(url.toString());
            }
            catch {
                return res.redirect('/');
            }
        }
    }
    async disconnect(userId) {
        await this.googleCalendarOAuth.disconnect(userId);
        return { connected: false };
    }
};
exports.GoogleCalendarAuthController = GoogleCalendarAuthController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google Calendar OAuth URL' }),
    (0, swagger_1.ApiQuery)({
        name: 'redirect_uri',
        required: true,
        type: String,
        description: 'Absolute URL to redirect back to after connect completes (frontend)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OAuth URL' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Query)('redirect_uri')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GoogleCalendarAuthController.prototype, "getAuthUrl", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Google Calendar OAuth callback' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirects back to redirect_uri with connected=1' }),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GoogleCalendarAuthController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect Google Calendar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disconnected' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GoogleCalendarAuthController.prototype, "disconnect", null);
exports.GoogleCalendarAuthController = GoogleCalendarAuthController = __decorate([
    (0, swagger_1.ApiTags)('google-calendar'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('auth/google/calendar'),
    __metadata("design:paramtypes", [google_calendar_oauth_service_1.GoogleCalendarOAuthService,
        google_oauth_state_service_1.GoogleOAuthStateService])
], GoogleCalendarAuthController);
//# sourceMappingURL=google-calendar-auth.controller.js.map