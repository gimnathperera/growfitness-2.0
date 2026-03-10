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
var GoogleCalendarSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarSyncService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const google_calendar_api_service_1 = require("./google-calendar-api.service");
let GoogleCalendarSyncService = GoogleCalendarSyncService_1 = class GoogleCalendarSyncService {
    sessionModel;
    userModel;
    kidModel;
    googleCalendarApi;
    logger = new common_1.Logger(GoogleCalendarSyncService_1.name);
    constructor(sessionModel, userModel, kidModel, googleCalendarApi) {
        this.sessionModel = sessionModel;
        this.userModel = userModel;
        this.kidModel = kidModel;
        this.googleCalendarApi = googleCalendarApi;
    }
    async getConnectedUserIds(candidateUserIds) {
        if (!candidateUserIds.length)
            return [];
        const objectIds = candidateUserIds
            .filter(Boolean)
            .filter(id => mongoose_2.Types.ObjectId.isValid(id))
            .map(id => new mongoose_2.Types.ObjectId(id));
        if (!objectIds.length)
            return [];
        const connected = await this.userModel
            .find({
            _id: { $in: objectIds },
            googleCalendarRefreshToken: { $exists: true, $ne: null },
        })
            .select('_id')
            .lean()
            .exec();
        return connected
            .map(u => u._id?.toString?.())
            .filter(Boolean);
    }
    async getConnectedAdminIds() {
        const admins = await this.userModel
            .find({
            role: shared_types_1.UserRole.ADMIN,
            googleCalendarRefreshToken: { $exists: true, $ne: null },
        })
            .select('_id')
            .lean()
            .exec();
        return admins
            .map(a => a._id?.toString?.())
            .filter(Boolean);
    }
    async getStakeholderUserIds(session) {
        const coachId = (session.coachId && typeof session.coachId === 'object'
            ? session.coachId._id?.toString?.() ?? session.coachId.id
            : session.coachId?.toString?.()) ?? null;
        const parentIds = new Set();
        const kids = Array.isArray(session.kids) ? session.kids : [];
        for (const k of kids) {
            const pid = k && typeof k === 'object'
                ? k.parentId?._id?.toString?.() ?? k.parentId?.toString?.()
                : null;
            if (pid)
                parentIds.add(pid);
        }
        const adminIds = await this.getConnectedAdminIds();
        const all = [coachId, ...Array.from(parentIds), ...adminIds].filter(Boolean);
        return Array.from(new Set(all));
    }
    async fetchSessionForSync(sessionId) {
        if (!mongoose_2.Types.ObjectId.isValid(sessionId))
            return null;
        return this.sessionModel
            .findById(sessionId)
            .populate('locationId')
            .populate('kids')
            .lean()
            .exec();
    }
    async syncSessionCreated(sessionId) {
        try {
            const session = await this.fetchSessionForSync(sessionId);
            if (!session)
                return;
            const stakeholderIds = await this.getStakeholderUserIds(session);
            const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);
            for (const userId of connectedStakeholders) {
                await this.googleCalendarApi.upsertSessionEvent(userId, session);
            }
        }
        catch (e) {
            this.logger.warn(`Google Calendar sync (create) failed for session ${sessionId}`, e);
        }
    }
    async syncSessionUpdated(sessionId) {
        try {
            const session = await this.fetchSessionForSync(sessionId);
            if (!session)
                return;
            const stakeholderIds = await this.getStakeholderUserIds(session);
            const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);
            for (const userId of connectedStakeholders) {
                await this.googleCalendarApi.upsertSessionEvent(userId, session);
            }
        }
        catch (e) {
            this.logger.warn(`Google Calendar sync (update) failed for session ${sessionId}`, e);
        }
    }
    async syncSessionDeleted(sessionId, coachId, kidObjectIds) {
        try {
            const parentIds = await this.getParentIdsFromKidObjectIds(kidObjectIds);
            const adminIds = await this.getConnectedAdminIds();
            const stakeholderIds = Array.from(new Set([coachId, ...parentIds, ...adminIds].filter(Boolean)));
            const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);
            const sessionObjectId = new mongoose_2.Types.ObjectId(sessionId);
            for (const userId of connectedStakeholders) {
                await this.googleCalendarApi.deleteSessionEvent(userId, sessionObjectId);
            }
        }
        catch (e) {
            this.logger.warn(`Google Calendar sync (delete) failed for session ${sessionId}`, e);
        }
    }
    async getParentIdsFromKidObjectIds(kidObjectIds) {
        if (!kidObjectIds?.length)
            return [];
        const kids = await this.kidModel
            .find({ _id: { $in: kidObjectIds } })
            .select('parentId')
            .lean()
            .exec();
        const parentIds = new Set();
        for (const k of kids) {
            const pid = k?.parentId?.toString?.() ?? k?.parentId;
            if (pid)
                parentIds.add(pid);
        }
        return Array.from(parentIds);
    }
};
exports.GoogleCalendarSyncService = GoogleCalendarSyncService;
exports.GoogleCalendarSyncService = GoogleCalendarSyncService = GoogleCalendarSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        google_calendar_api_service_1.GoogleCalendarApiService])
], GoogleCalendarSyncService);
//# sourceMappingURL=google-calendar-sync.service.js.map