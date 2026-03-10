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
var SessionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const google_calendar_sync_service_1 = require("../google-calendar/google-calendar-sync.service");
let SessionsService = SessionsService_1 = class SessionsService {
    sessionModel;
    kidModel;
    userModel;
    auditService;
    notificationService;
    googleCalendarSync;
    logger = new common_1.Logger(SessionsService_1.name);
    constructor(sessionModel, kidModel, userModel, auditService, notificationService, googleCalendarSync) {
        this.sessionModel = sessionModel;
        this.kidModel = kidModel;
        this.userModel = userModel;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.googleCalendarSync = googleCalendarSync;
    }
    toObjectId(id, fieldName) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_ID,
                message: `Invalid ${fieldName} format. Expected a valid MongoDB ObjectId.`,
            });
        }
        return new mongoose_2.Types.ObjectId(id);
    }
    toObjectIdArray(ids, fieldName) {
        if (!ids)
            return ids;
        return ids.map(id => this.toObjectId(id, fieldName));
    }
    async getParentIdsFromKidIds(kidIds) {
        if (!kidIds?.length)
            return [];
        const kids = await this.kidModel
            .find({ _id: { $in: kidIds } })
            .select('parentId')
            .lean()
            .exec();
        const parentIds = new Set();
        for (const k of kids) {
            const pid = k.parentId?.toString?.() ?? k.parentId;
            if (pid)
                parentIds.add(pid);
        }
        return Array.from(parentIds);
    }
    async findAll(pagination, filters) {
        const query = {};
        if (filters?.isFreeSession !== undefined) {
            query.isFreeSession = filters.isFreeSession;
        }
        if (filters?.coachId) {
            query.coachId = this.toObjectId(filters.coachId, 'coachId');
        }
        if (filters?.locationId) {
            query.locationId = this.toObjectId(filters.locationId, 'locationId');
        }
        if (filters?.kidId?.trim()) {
            query.kids = this.toObjectId(filters.kidId.trim(), 'kidId');
        }
        if (filters?.status) {
            query.status = filters.status;
        }
        if (filters?.startDate || filters?.endDate) {
            const dateTimeFilter = {};
            if (filters.startDate) {
                dateTimeFilter.$gte = filters.startDate;
            }
            if (filters.endDate) {
                dateTimeFilter.$lte = filters.endDate;
            }
            query.dateTime = dateTimeFilter;
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.sessionModel
                .find(query)
                .populate('coachId', 'email coachProfile')
                .populate('locationId')
                .populate('kids')
                .sort({ dateTime: 1 })
                .skip(skip)
                .limit(pagination.limit)
                .lean()
                .exec(),
            this.sessionModel.countDocuments(query).exec(),
        ]);
        const transformedData = data.map(s => this.toSessionResponse(s));
        return new pagination_dto_1.PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const session = await this.sessionModel
            .findById(id)
            .populate('coachId', 'email coachProfile')
            .populate('locationId')
            .populate('kids')
            .lean()
            .exec();
        if (!session) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.SESSION_NOT_FOUND,
                message: 'Session not found',
            });
        }
        return this.toSessionResponse(session);
    }
    toSessionResponse(s) {
        const coachIdVal = s.coachId?._id ?? s.coachId;
        const locationIdVal = s.locationId?._id ?? s.locationId;
        const coach = s.coachId && typeof s.coachId === 'object'
            ? {
                id: s.coachId._id?.toString(),
                email: s.coachId.email,
                coachProfile: s.coachId.coachProfile,
            }
            : undefined;
        const location = s.locationId && typeof s.locationId === 'object'
            ? {
                id: s.locationId._id?.toString(),
                name: s.locationId.name,
                address: s.locationId.address,
                geo: s.locationId.geo,
                isActive: s.locationId.isActive,
                placeUrl: s.locationId.placeUrl,
            }
            : undefined;
        const kids = Array.isArray(s.kids)
            ? s.kids.map((k) => k && typeof k === 'object' && k._id ? k._id.toString() : (k?.toString?.() ?? k))
            : undefined;
        return {
            id: s._id?.toString(),
            title: s.title,
            type: s.type,
            coachId: coachIdVal != null ? coachIdVal.toString() : undefined,
            locationId: locationIdVal != null ? locationIdVal.toString() : undefined,
            coach,
            location,
            dateTime: s.dateTime,
            duration: s.duration,
            capacity: s.capacity,
            kids,
            status: s.status,
            isFreeSession: s.isFreeSession,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        };
    }
    async create(createSessionDto, actorId) {
        if (!createSessionDto.kids?.length) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'At least one kid ID is required',
            });
        }
        if (createSessionDto.type === shared_types_1.SessionType.INDIVIDUAL && createSessionDto.kids.length !== 1) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Individual sessions require exactly one kid ID',
            });
        }
        const capacity = createSessionDto.capacity ?? (createSessionDto.type === shared_types_1.SessionType.GROUP ? 10 : 1);
        if (createSessionDto.type === shared_types_1.SessionType.GROUP && createSessionDto.kids.length > capacity) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_SESSION_CAPACITY,
                message: 'Number of kids exceeds session capacity',
            });
        }
        const coachObjectId = this.toObjectId(createSessionDto.coachId, 'coachId');
        const locationObjectId = this.toObjectId(createSessionDto.locationId, 'locationId');
        const kidObjectIds = this.toObjectIdArray(createSessionDto.kids, 'kids');
        const session = new this.sessionModel({
            ...createSessionDto,
            coachId: coachObjectId,
            locationId: locationObjectId,
            kids: kidObjectIds,
            dateTime: new Date(createSessionDto.dateTime),
            capacity,
        });
        await session.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_SESSION',
            entityType: 'Session',
            entityId: session._id.toString(),
            metadata: createSessionDto,
        });
        const sessionIdStr = session._id.toString();
        const parentIds = await this.getParentIdsFromKidIds(session.kids ?? []);
        const coachIdStr = session.coachId.toString();
        const title = 'New session scheduled';
        const body = `Session "${session.title}" has been scheduled.`;
        await this.notificationService.createNotification({
            userId: coachIdStr,
            type: shared_types_1.NotificationType.SESSION_CREATED,
            title,
            body,
            entityType: 'Session',
            entityId: sessionIdStr,
        });
        for (const parentId of parentIds) {
            await this.notificationService.createNotification({
                userId: parentId,
                type: shared_types_1.NotificationType.SESSION_CREATED,
                title,
                body,
                entityType: 'Session',
                entityId: sessionIdStr,
            });
        }
        this.googleCalendarSync
            .syncSessionCreated(sessionIdStr)
            .catch(err => this.logger.warn(`Google Calendar sync failed for session ${sessionIdStr}`, err));
        return this.findById(sessionIdStr);
    }
    async update(id, updateSessionDto, actorId) {
        const session = await this.sessionModel.findById(id).exec();
        if (!session) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.SESSION_NOT_FOUND,
                message: 'Session not found',
            });
        }
        if (updateSessionDto.kids &&
            updateSessionDto.kids.length > 0 &&
            session.type === shared_types_1.SessionType.INDIVIDUAL &&
            updateSessionDto.kids.length !== 1) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Individual sessions require exactly one kid ID',
            });
        }
        if (updateSessionDto.kids &&
            session.type === shared_types_1.SessionType.GROUP &&
            updateSessionDto.kids.length > (updateSessionDto.capacity ?? session.capacity)) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_SESSION_CAPACITY,
                message: 'Number of kids exceeds session capacity',
            });
        }
        const updatedFields = {
            ...(updateSessionDto.title && { title: updateSessionDto.title }),
            ...(updateSessionDto.coachId && {
                coachId: this.toObjectId(updateSessionDto.coachId, 'coachId'),
            }),
            ...(updateSessionDto.locationId && {
                locationId: this.toObjectId(updateSessionDto.locationId, 'locationId'),
            }),
            ...(updateSessionDto.dateTime && { dateTime: new Date(updateSessionDto.dateTime) }),
            ...(updateSessionDto.duration && { duration: updateSessionDto.duration }),
            ...(updateSessionDto.capacity && { capacity: updateSessionDto.capacity }),
            ...(updateSessionDto.kids && { kids: this.toObjectIdArray(updateSessionDto.kids, 'kids') }),
            ...(updateSessionDto.status && { status: updateSessionDto.status }),
            ...(updateSessionDto.isFreeSession !== undefined && {
                isFreeSession: updateSessionDto.isFreeSession,
            }),
        };
        const previousStatus = session.status;
        const previousDateTime = session.dateTime;
        Object.assign(session, {
            ...updatedFields,
        });
        await session.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_SESSION',
            entityType: 'Session',
            entityId: id,
            metadata: updateSessionDto,
        });
        const statusChanged = updateSessionDto.status !== undefined && updateSessionDto.status !== previousStatus;
        const dateTimeChanged = updateSessionDto.dateTime !== undefined &&
            new Date(updateSessionDto.dateTime).getTime() !== previousDateTime.getTime();
        if (statusChanged || dateTimeChanged) {
            const notifType = session.status === shared_types_1.SessionStatus.CANCELLED
                ? shared_types_1.NotificationType.SESSION_CANCELLED
                : session.status === shared_types_1.SessionStatus.COMPLETED
                    ? shared_types_1.NotificationType.SESSION_COMPLETED
                    : shared_types_1.NotificationType.SESSION_UPDATED;
            const changes = [];
            if (statusChanged)
                changes.push(`status: ${previousStatus} → ${session.status}`);
            if (dateTimeChanged)
                changes.push(`date/time updated`);
            const changesStr = changes.length ? changes.join('; ') : 'Session updated';
            const sessionPopulated = await this.sessionModel
                .findById(id)
                .populate('coachId', 'email phone')
                .populate('kids')
                .exec();
            if (sessionPopulated) {
                const coachIdStr = sessionPopulated.coachId?._id?.toString?.() ??
                    sessionPopulated.coachId?.toString?.();
                const parentIds = await this.getParentIdsFromKidIds(sessionPopulated.kids ?? []);
                const recipientIds = [coachIdStr, ...parentIds].filter(Boolean);
                for (const userId of recipientIds) {
                    await this.notificationService.createNotification({
                        userId,
                        type: notifType,
                        title: 'Session updated',
                        body: `Session "${session.title}": ${changesStr}`,
                        entityType: 'Session',
                        entityId: id,
                    });
                }
                const coachUser = coachIdStr
                    ? await this.userModel.findById(coachIdStr).select('email phone').lean().exec()
                    : null;
                if (coachUser && coachUser.email) {
                    await this.notificationService.sendSessionChange({
                        email: coachUser.email,
                        phone: coachUser.phone ?? '',
                        sessionId: id,
                        changes: changesStr,
                    });
                }
                for (const parentId of parentIds) {
                    const parent = await this.userModel
                        .findById(parentId)
                        .select('email phone')
                        .lean()
                        .exec();
                    if (parent && parent.email) {
                        await this.notificationService.sendSessionChange({
                            email: parent.email,
                            phone: parent.phone ?? '',
                            sessionId: id,
                            changes: changesStr,
                        });
                    }
                }
            }
        }
        const calendarRelevantChanged = Boolean(updateSessionDto.title ||
            updateSessionDto.locationId ||
            updateSessionDto.dateTime ||
            updateSessionDto.duration ||
            updateSessionDto.status);
        if (calendarRelevantChanged) {
            this.googleCalendarSync
                .syncSessionUpdated(id)
                .catch(err => this.logger.warn(`Google Calendar sync failed for session ${id}`, err));
        }
        return this.findById(id);
    }
    async findByDateRange(startDate, endDate) {
        return this.sessionModel
            .find({
            dateTime: {
                $gte: startDate,
                $lt: endDate,
            },
        })
            .populate('coachId', 'email coachProfile')
            .populate('locationId')
            .populate('kids')
            .sort({ dateTime: 1 })
            .exec();
    }
    async getWeeklySummary(startDate, endDate) {
        const sessions = await this.findByDateRange(startDate, endDate);
        const summary = {
            total: sessions.length,
            byType: {
                INDIVIDUAL: sessions.filter(s => s.type === shared_types_1.SessionType.INDIVIDUAL).length,
                GROUP: sessions.filter(s => s.type === shared_types_1.SessionType.GROUP).length,
            },
            byStatus: {
                SCHEDULED: sessions.filter(s => s.status === shared_types_1.SessionStatus.SCHEDULED).length,
                CONFIRMED: sessions.filter(s => s.status === shared_types_1.SessionStatus.CONFIRMED).length,
                CANCELLED: sessions.filter(s => s.status === shared_types_1.SessionStatus.CANCELLED).length,
                COMPLETED: sessions.filter(s => s.status === shared_types_1.SessionStatus.COMPLETED).length,
            },
        };
        return summary;
    }
    async delete(id, actorId) {
        const session = await this.sessionModel.findById(id).exec();
        if (!session) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.SESSION_NOT_FOUND,
                message: 'Session not found',
            });
        }
        const coachIdStr = session.coachId.toString();
        const parentIds = await this.getParentIdsFromKidIds(session.kids ?? []);
        const title = 'Session deleted';
        const body = `Session "${session.title}" has been deleted.`;
        await this.notificationService.createNotification({
            userId: coachIdStr,
            type: shared_types_1.NotificationType.SESSION_DELETED,
            title,
            body,
            entityType: 'Session',
            entityId: id,
        });
        for (const parentId of parentIds) {
            await this.notificationService.createNotification({
                userId: parentId,
                type: shared_types_1.NotificationType.SESSION_DELETED,
                title,
                body,
                entityType: 'Session',
                entityId: id,
            });
        }
        await this.sessionModel.findByIdAndDelete(id).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_SESSION',
            entityType: 'Session',
            entityId: id,
        });
        this.googleCalendarSync
            .syncSessionDeleted(id, session.coachId.toString(), (session.kids ?? []))
            .catch(err => this.logger.warn(`Google Calendar sync failed for deleted session ${id}`, err));
        return { message: 'Session deleted successfully' };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = SessionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __param(1, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService,
        notifications_service_1.NotificationService,
        google_calendar_sync_service_1.GoogleCalendarSyncService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map