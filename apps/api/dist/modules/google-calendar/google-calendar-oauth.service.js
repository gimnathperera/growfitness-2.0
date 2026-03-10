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
exports.GoogleCalendarOAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const googleapis_1 = require("googleapis");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const google_oauth_state_service_1 = require("./google-oauth-state.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let GoogleCalendarOAuthService = class GoogleCalendarOAuthService {
    configService;
    stateService;
    userModel;
    constructor(configService, stateService, userModel) {
        this.configService = configService;
        this.stateService = stateService;
        this.userModel = userModel;
    }
    validateRedirectUri(redirectUri) {
        let url;
        try {
            url = new URL(redirectUri);
        }
        catch {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'redirect_uri must be a valid absolute URL',
            });
        }
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'redirect_uri must use http or https',
            });
        }
        const corsOrigin = this.configService.get('CORS_ORIGIN', '').trim();
        if (corsOrigin) {
            const allowedOrigins = corsOrigin
                .split(',')
                .map(o => o.trim())
                .filter(Boolean);
            if (!allowedOrigins.includes(url.origin)) {
                throw new common_1.BadRequestException({
                    errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                    message: 'redirect_uri origin is not allowed',
                });
            }
        }
        url.hash = '';
        return url.toString();
    }
    getOauthClient() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI');
        if (!clientId || !clientSecret || !redirectUri) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Google Calendar OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALENDAR_REDIRECT_URI.',
            });
        }
        return new googleapis_1.google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }
    async buildAuthUrl(userId, redirectUri) {
        const normalizedRedirectUri = this.validateRedirectUri(redirectUri);
        const user = await this.userModel
            .findById(userId)
            .select('googleCalendarRefreshToken')
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'User not found',
            });
        }
        const oauth2Client = this.getOauthClient();
        const state = this.stateService.sign({ userId, redirectUri: normalizedRedirectUri }, 10 * 60 * 1000);
        const hasRefreshToken = Boolean(user.googleCalendarRefreshToken);
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            include_granted_scopes: true,
            scope: ['https://www.googleapis.com/auth/calendar.events'],
            ...(hasRefreshToken ? {} : { prompt: 'consent' }),
            state,
        });
    }
    async handleCallback(code, state) {
        if (!code) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Missing OAuth code',
            });
        }
        if (!state) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Missing OAuth state',
            });
        }
        const payload = this.stateService.verify(state);
        const oauth2Client = this.getOauthClient();
        const tokenResponse = await oauth2Client.getToken(code);
        const refreshToken = tokenResponse.tokens.refresh_token;
        await this.userModel
            .findByIdAndUpdate(payload.userId, {
            ...(refreshToken ? { googleCalendarRefreshToken: refreshToken } : {}),
            googleCalendarConnectedAt: new Date(),
        })
            .exec();
        return { redirectUri: payload.redirectUri };
    }
    async disconnect(userId) {
        await this.userModel
            .findByIdAndUpdate(userId, {
            $unset: {
                googleCalendarRefreshToken: 1,
                googleCalendarConnectedAt: 1,
            },
        })
            .exec();
    }
    async isConnected(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('googleCalendarRefreshToken')
            .lean()
            .exec();
        return Boolean(user?.googleCalendarRefreshToken);
    }
};
exports.GoogleCalendarOAuthService = GoogleCalendarOAuthService;
exports.GoogleCalendarOAuthService = GoogleCalendarOAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        google_oauth_state_service_1.GoogleOAuthStateService,
        mongoose_2.Model])
], GoogleCalendarOAuthService);
//# sourceMappingURL=google-calendar-oauth.service.js.map