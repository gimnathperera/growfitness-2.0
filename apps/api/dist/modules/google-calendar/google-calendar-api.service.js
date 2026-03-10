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
var GoogleCalendarApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const googleapis_1 = require("googleapis");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const google_calendar_event_schema_1 = require("../../infra/database/schemas/google-calendar-event.schema");
let GoogleCalendarApiService = GoogleCalendarApiService_1 = class GoogleCalendarApiService {
    configService;
    userModel;
    mappingModel;
    logger = new common_1.Logger(GoogleCalendarApiService_1.name);
    constructor(configService, userModel, mappingModel) {
        this.configService = configService;
        this.userModel = userModel;
        this.mappingModel = mappingModel;
    }
    getOauthClientForRefreshToken(refreshToken) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get('GOOGLE_CALENDAR_REDIRECT_URI');
        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('Google Calendar OAuth not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALENDAR_REDIRECT_URI)');
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, redirectUri);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        return oauth2Client;
    }
    buildEvent(session) {
        const start = new Date(session.dateTime);
        const end = new Date(start.getTime() + session.duration * 60_000);
        const locationName = session.locationId?.name;
        const locationAddress = session.locationId?.address;
        const location = [locationName, locationAddress].filter(Boolean).join(' - ') || undefined;
        const descriptionLines = [
            'Grow Fitness session',
            `Type: ${session.type}`,
            `Status: ${session.status}`,
            `SessionId: ${session._id.toString()}`,
        ];
        return {
            summary: session.title,
            description: descriptionLines.join('\n'),
            ...(location ? { location } : {}),
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
        };
    }
    async getUserRefreshToken(userId) {
        const user = await this.userModel
            .findById(userId)
            .select('googleCalendarRefreshToken')
            .lean()
            .exec();
        return user?.googleCalendarRefreshToken;
    }
    async getMapping(userId, sessionObjectId) {
        return this.mappingModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId), sessionId: sessionObjectId })
            .lean()
            .exec();
    }
    async setMapping(userId, sessionObjectId, googleEventId) {
        await this.mappingModel
            .findOneAndUpdate({ userId: new mongoose_2.Types.ObjectId(userId), sessionId: sessionObjectId }, { userId: new mongoose_2.Types.ObjectId(userId), sessionId: sessionObjectId, googleEventId }, { upsert: true, new: true })
            .exec();
    }
    async removeMapping(userId, sessionObjectId) {
        await this.mappingModel
            .deleteOne({ userId: new mongoose_2.Types.ObjectId(userId), sessionId: sessionObjectId })
            .exec();
    }
    async upsertSessionEvent(userId, session) {
        const refreshToken = await this.getUserRefreshToken(userId);
        if (!refreshToken)
            return;
        const oauth2Client = this.getOauthClientForRefreshToken(refreshToken);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        const sessionObjectId = session._id;
        const mapping = await this.getMapping(userId, sessionObjectId);
        const event = this.buildEvent(session);
        if (!mapping?.googleEventId) {
            const created = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            });
            const googleEventId = created.data.id;
            if (googleEventId) {
                await this.setMapping(userId, sessionObjectId, googleEventId);
            }
            return;
        }
        try {
            await calendar.events.patch({
                calendarId: 'primary',
                eventId: mapping.googleEventId,
                requestBody: event,
            });
        }
        catch (e) {
            const status = e?.code ?? e?.response?.status;
            if (status === 404) {
                const created = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event,
                });
                const googleEventId = created.data.id;
                if (googleEventId) {
                    await this.setMapping(userId, sessionObjectId, googleEventId);
                }
                return;
            }
            this.logger.warn(`Failed to update Google Calendar event for user ${userId}`, e);
        }
    }
    async deleteSessionEvent(userId, sessionObjectId) {
        const refreshToken = await this.getUserRefreshToken(userId);
        if (!refreshToken)
            return;
        const mapping = await this.getMapping(userId, sessionObjectId);
        if (!mapping?.googleEventId) {
            await this.removeMapping(userId, sessionObjectId);
            return;
        }
        const oauth2Client = this.getOauthClientForRefreshToken(refreshToken);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: mapping.googleEventId,
            });
        }
        catch (e) {
            const status = e?.code ?? e?.response?.status;
            if (status !== 404) {
                this.logger.warn(`Failed to delete Google Calendar event for user ${userId}`, e);
            }
        }
        finally {
            await this.removeMapping(userId, sessionObjectId);
        }
    }
};
exports.GoogleCalendarApiService = GoogleCalendarApiService;
exports.GoogleCalendarApiService = GoogleCalendarApiService = GoogleCalendarApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(google_calendar_event_schema_1.GoogleCalendarEvent.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model])
], GoogleCalendarApiService);
//# sourceMappingURL=google-calendar-api.service.js.map