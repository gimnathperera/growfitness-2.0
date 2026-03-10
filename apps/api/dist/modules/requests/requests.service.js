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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const free_session_request_schema_1 = require("../../infra/database/schemas/free-session-request.schema");
const reschedule_request_schema_1 = require("../../infra/database/schemas/reschedule-request.schema");
const extra_session_request_schema_1 = require("../../infra/database/schemas/extra-session-request.schema");
const user_registration_request_schema_1 = require("../../infra/database/schemas/user-registration-request.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const mongoose_3 = require("mongoose");
let RequestsService = class RequestsService {
    freeSessionRequestModel;
    rescheduleRequestModel;
    extraSessionRequestModel;
    userRegistrationRequestModel;
    userModel;
    kidModel;
    sessionModel;
    auditService;
    notificationService;
    constructor(freeSessionRequestModel, rescheduleRequestModel, extraSessionRequestModel, userRegistrationRequestModel, userModel, kidModel, sessionModel, auditService, notificationService) {
        this.freeSessionRequestModel = freeSessionRequestModel;
        this.rescheduleRequestModel = rescheduleRequestModel;
        this.extraSessionRequestModel = extraSessionRequestModel;
        this.userRegistrationRequestModel = userRegistrationRequestModel;
        this.userModel = userModel;
        this.kidModel = kidModel;
        this.sessionModel = sessionModel;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async notifyAdmins(type, title, body, entityType, entityId) {
        const admins = await this.userModel.find({ role: shared_types_1.UserRole.ADMIN }).select('_id').lean().exec();
        for (const a of admins) {
            const id = a._id?.toString?.();
            if (id) {
                await this.notificationService.createNotification({
                    userId: id,
                    type,
                    title,
                    body,
                    entityType,
                    entityId,
                });
            }
        }
    }
    async createFreeSessionRequest(data) {
        const request = new this.freeSessionRequestModel({
            ...data,
            selectedSessionId: data.selectedSessionId
                ? new mongoose_3.Types.ObjectId(data.selectedSessionId)
                : undefined,
            locationId: new mongoose_3.Types.ObjectId(data.locationId),
            preferredDateTime: new Date(data.preferredDateTime),
            status: shared_types_1.RequestStatus.PENDING,
        });
        const saved = await request.save();
        await this.notifyAdmins(shared_types_1.NotificationType.FREE_SESSION_REQUEST, 'New free session request', `${data.parentName} requested a free session for ${data.kidName}.`, 'FreeSessionRequest', saved._id.toString());
        return saved;
    }
    async findFreeSessionRequests(pagination) {
        const filter = { status: shared_types_1.RequestStatus.PENDING };
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.freeSessionRequestModel
                .find(filter)
                .populate('selectedSessionId')
                .populate('locationId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .exec(),
            this.freeSessionRequestModel.countDocuments(filter).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async countFreeSessionRequests() {
        return this.freeSessionRequestModel.countDocuments({ status: shared_types_1.RequestStatus.PENDING }).exec();
    }
    async selectFreeSessionRequest(id, actorId, sessionId) {
        const request = await this.freeSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Free session request not found',
            });
        }
        request.status = shared_types_1.RequestStatus.SELECTED;
        if (sessionId) {
            request.selectedSessionId = sessionId;
        }
        await request.save();
        await this.notificationService.sendFreeSessionConfirmation({
            email: request.email,
            phone: request.phone,
            parentName: request.parentName,
            kidName: request.kidName,
            sessionId: request.selectedSessionId?.toString(),
        });
        const parent = await this.userModel
            .findOne({ email: request.email.toLowerCase(), role: shared_types_1.UserRole.PARENT })
            .select('_id')
            .lean()
            .exec();
        if (parent && parent._id) {
            await this.notificationService.createNotification({
                userId: parent._id.toString(),
                type: shared_types_1.NotificationType.FREE_SESSION_SELECTED,
                title: 'Free session confirmed',
                body: `Your free session request for ${request.kidName} has been confirmed.`,
                entityType: 'FreeSessionRequest',
                entityId: id,
            });
        }
        await this.auditService.log({
            actorId,
            action: 'SELECT_FREE_SESSION_REQUEST',
            entityType: 'FreeSessionRequest',
            entityId: id,
        });
        return request;
    }
    async createRescheduleRequest(dto, requestedById) {
        const session = await this.sessionModel.findById(dto.sessionId).exec();
        if (!session) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Session not found',
            });
        }
        const request = new this.rescheduleRequestModel({
            sessionId: new mongoose_3.Types.ObjectId(dto.sessionId),
            requestedBy: new mongoose_3.Types.ObjectId(requestedById),
            newDateTime: new Date(dto.newDateTime),
            reason: dto.reason,
            status: shared_types_1.RequestStatus.PENDING,
        });
        const saved = await request.save();
        await this.auditService.log({
            actorId: requestedById,
            action: 'CREATE_RESCHEDULE_REQUEST',
            entityType: 'RescheduleRequest',
            entityId: saved._id.toString(),
            metadata: dto,
        });
        await this.notifyAdmins(shared_types_1.NotificationType.RESCHEDULE_REQUEST, 'New reschedule request', 'A session reschedule has been requested.', 'RescheduleRequest', saved._id.toString());
        const sessionWithCoach = await this.sessionModel
            .findById(dto.sessionId)
            .select('coachId')
            .lean()
            .exec();
        if (sessionWithCoach && sessionWithCoach.coachId) {
            const coachId = sessionWithCoach.coachId?.toString?.() ?? sessionWithCoach.coachId;
            if (coachId) {
                await this.notificationService.createNotification({
                    userId: coachId,
                    type: shared_types_1.NotificationType.RESCHEDULE_REQUEST,
                    title: 'Reschedule request',
                    body: 'A reschedule has been requested for one of your sessions.',
                    entityType: 'RescheduleRequest',
                    entityId: saved._id.toString(),
                });
            }
        }
        return saved.populate(['sessionId', 'requestedBy']);
    }
    async findRescheduleRequests(pagination) {
        const filter = { status: shared_types_1.RequestStatus.PENDING };
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.rescheduleRequestModel
                .find(filter)
                .populate('sessionId')
                .populate('requestedBy', 'email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .exec(),
            this.rescheduleRequestModel.countDocuments(filter).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async countRescheduleRequests() {
        return this.rescheduleRequestModel.countDocuments({ status: shared_types_1.RequestStatus.PENDING }).exec();
    }
    async approveRescheduleRequest(id, actorId) {
        const request = await this.rescheduleRequestModel
            .findById(id)
            .populate('sessionId')
            .populate('requestedBy', 'email')
            .exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Reschedule request not found',
            });
        }
        request.status = shared_types_1.RequestStatus.APPROVED;
        request.processedAt = new Date();
        await request.save();
        const requestedById = request.requestedBy instanceof mongoose_3.Types.ObjectId
            ? request.requestedBy.toString()
            : (request.requestedBy?._id?.toString?.() ?? request.requestedBy?.id);
        if (requestedById) {
            await this.notificationService.createNotification({
                userId: requestedById,
                type: shared_types_1.NotificationType.RESCHEDULE_APPROVED,
                title: 'Reschedule approved',
                body: 'Your session reschedule request has been approved.',
                entityType: 'RescheduleRequest',
                entityId: id,
            });
        }
        await this.auditService.log({
            actorId,
            action: 'APPROVE_RESCHEDULE_REQUEST',
            entityType: 'RescheduleRequest',
            entityId: id,
        });
        return request;
    }
    async denyRescheduleRequest(id, actorId) {
        const request = await this.rescheduleRequestModel
            .findById(id)
            .populate('requestedBy', 'email')
            .exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Reschedule request not found',
            });
        }
        request.status = shared_types_1.RequestStatus.DENIED;
        request.processedAt = new Date();
        await request.save();
        const requestedById = request.requestedBy instanceof mongoose_3.Types.ObjectId
            ? request.requestedBy.toString()
            : (request.requestedBy?._id?.toString?.() ?? request.requestedBy?.id);
        if (requestedById) {
            await this.notificationService.createNotification({
                userId: requestedById,
                type: shared_types_1.NotificationType.RESCHEDULE_DENIED,
                title: 'Reschedule denied',
                body: 'Your session reschedule request has been denied.',
                entityType: 'RescheduleRequest',
                entityId: id,
            });
        }
        await this.auditService.log({
            actorId,
            action: 'DENY_RESCHEDULE_REQUEST',
            entityType: 'RescheduleRequest',
            entityId: id,
        });
        return request;
    }
    async createExtraSessionRequest(dto, actorId, actorRole) {
        const parentId = actorRole === shared_types_1.UserRole.PARENT ? actorId : dto.parentId;
        if (!parentId) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Parent ID is required (required in body when creating as admin)',
            });
        }
        if (actorRole === shared_types_1.UserRole.PARENT) {
            const kid = await this.kidModel.findOne({ _id: dto.kidId, parentId }).exec();
            if (!kid) {
                throw new common_1.NotFoundException({
                    errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                    message: 'Kid not found or does not belong to you',
                });
            }
        }
        const request = new this.extraSessionRequestModel({
            parentId: new mongoose_3.Types.ObjectId(parentId),
            kidId: new mongoose_3.Types.ObjectId(dto.kidId),
            coachId: new mongoose_3.Types.ObjectId(dto.coachId),
            sessionType: dto.sessionType,
            locationId: new mongoose_3.Types.ObjectId(dto.locationId),
            preferredDateTime: new Date(dto.preferredDateTime),
            status: shared_types_1.RequestStatus.PENDING,
        });
        const saved = await request.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_EXTRA_SESSION_REQUEST',
            entityType: 'ExtraSessionRequest',
            entityId: saved._id.toString(),
            metadata: { ...dto, parentId },
        });
        await this.notifyAdmins(shared_types_1.NotificationType.EXTRA_SESSION_REQUEST, 'New extra session request', 'An extra session has been requested.', 'ExtraSessionRequest', saved._id.toString());
        if (dto.coachId) {
            await this.notificationService.createNotification({
                userId: dto.coachId,
                type: shared_types_1.NotificationType.EXTRA_SESSION_REQUEST,
                title: 'Extra session request',
                body: 'A parent has requested an extra session with you.',
                entityType: 'ExtraSessionRequest',
                entityId: saved._id.toString(),
            });
        }
        return saved.populate(['parentId', 'kidId', 'coachId', 'locationId']);
    }
    async findExtraSessionRequests(pagination) {
        const filter = { status: shared_types_1.RequestStatus.PENDING };
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.extraSessionRequestModel
                .find(filter)
                .populate('parentId', 'email parentProfile')
                .populate('kidId')
                .populate('coachId', 'email coachProfile')
                .populate('locationId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .exec(),
            this.extraSessionRequestModel.countDocuments(filter).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async approveExtraSessionRequest(id, actorId) {
        const request = await this.extraSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Extra session request not found',
            });
        }
        request.status = shared_types_1.RequestStatus.APPROVED;
        await request.save();
        const parentId = request.parentId?.toString?.();
        if (parentId) {
            await this.notificationService.createNotification({
                userId: parentId,
                type: shared_types_1.NotificationType.EXTRA_SESSION_APPROVED,
                title: 'Extra session approved',
                body: 'Your extra session request has been approved.',
                entityType: 'ExtraSessionRequest',
                entityId: id,
            });
        }
        await this.auditService.log({
            actorId,
            action: 'APPROVE_EXTRA_SESSION_REQUEST',
            entityType: 'ExtraSessionRequest',
            entityId: id,
        });
        return request;
    }
    async denyExtraSessionRequest(id, actorId) {
        const request = await this.extraSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Extra session request not found',
            });
        }
        request.status = shared_types_1.RequestStatus.DENIED;
        await request.save();
        const parentId = request.parentId?.toString?.();
        if (parentId) {
            await this.notificationService.createNotification({
                userId: parentId,
                type: shared_types_1.NotificationType.EXTRA_SESSION_DENIED,
                title: 'Extra session denied',
                body: 'Your extra session request has been denied.',
                entityType: 'ExtraSessionRequest',
                entityId: id,
            });
        }
        await this.auditService.log({
            actorId,
            action: 'DENY_EXTRA_SESSION_REQUEST',
            entityType: 'ExtraSessionRequest',
            entityId: id,
        });
        return request;
    }
    async deleteFreeSessionRequest(id, actorId) {
        const request = await this.freeSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Free session request not found',
            });
        }
        await this.freeSessionRequestModel.findByIdAndDelete(id).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_FREE_SESSION_REQUEST',
            entityType: 'FreeSessionRequest',
            entityId: id,
        });
        return { message: 'Free session request deleted successfully' };
    }
    async deleteRescheduleRequest(id, actorId) {
        const request = await this.rescheduleRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Reschedule request not found',
            });
        }
        await this.rescheduleRequestModel.findByIdAndDelete(id).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_RESCHEDULE_REQUEST',
            entityType: 'RescheduleRequest',
            entityId: id,
        });
        return { message: 'Reschedule request deleted successfully' };
    }
    async deleteExtraSessionRequest(id, actorId) {
        const request = await this.extraSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Extra session request not found',
            });
        }
        await this.extraSessionRequestModel.findByIdAndDelete(id).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_EXTRA_SESSION_REQUEST',
            entityType: 'ExtraSessionRequest',
            entityId: id,
        });
        return { message: 'Extra session request deleted successfully' };
    }
    async updateFreeSessionRequest(id, updateData, actorId) {
        const request = await this.freeSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Free session request not found',
            });
        }
        if (updateData.status) {
            request.status = updateData.status;
        }
        if (updateData.selectedSessionId) {
            request.selectedSessionId = updateData.selectedSessionId;
        }
        await request.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_FREE_SESSION_REQUEST',
            entityType: 'FreeSessionRequest',
            entityId: id,
            metadata: updateData,
        });
        return request;
    }
    async updateRescheduleRequest(id, updateData, actorId) {
        const request = await this.rescheduleRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Reschedule request not found',
            });
        }
        if (updateData.status !== undefined) {
            request.status = updateData.status;
            if (updateData.status !== shared_types_1.RequestStatus.PENDING) {
                request.processedAt = new Date();
            }
        }
        if (updateData.newDateTime) {
            request.newDateTime = updateData.newDateTime;
        }
        if (updateData.reason) {
            request.reason = updateData.reason;
        }
        await request.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_RESCHEDULE_REQUEST',
            entityType: 'RescheduleRequest',
            entityId: id,
            metadata: updateData,
        });
        return request;
    }
    async updateExtraSessionRequest(id, updateData, actorId) {
        const request = await this.extraSessionRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'Extra session request not found',
            });
        }
        if (updateData.status !== undefined) {
            request.status = updateData.status;
        }
        if (updateData.preferredDateTime) {
            request.preferredDateTime = updateData.preferredDateTime;
        }
        await request.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_EXTRA_SESSION_REQUEST',
            entityType: 'ExtraSessionRequest',
            entityId: id,
            metadata: updateData,
        });
        return request;
    }
    async findUserRegistrationRequests(pagination) {
        const filter = { status: shared_types_1.RequestStatus.PENDING };
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.userRegistrationRequestModel
                .find(filter)
                .populate('parentId', 'email phone parentProfile status')
                .populate('processedBy', 'email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pagination.limit)
                .exec(),
            this.userRegistrationRequestModel.countDocuments(filter).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async approveUserRegistrationRequest(id, actorId) {
        try {
            const request = await this.userRegistrationRequestModel.findById(id).exec();
            if (!request) {
                throw new common_1.NotFoundException({
                    errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                    message: 'User registration request not found',
                });
            }
            if (!request.parentId) {
                throw new common_1.NotFoundException({
                    errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                    message: 'Parent ID not found in registration request',
                });
            }
            let parentId;
            if (request.parentId instanceof mongoose_3.Types.ObjectId) {
                parentId = request.parentId;
            }
            else if (typeof request.parentId === 'object' && request.parentId !== null) {
                parentId = request.parentId._id || request.parentId.id;
                if (!parentId) {
                    throw new common_1.NotFoundException({
                        errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                        message: 'Invalid parent ID in registration request',
                    });
                }
            }
            else {
                parentId = request.parentId;
            }
            const parentIdString = parentId instanceof mongoose_3.Types.ObjectId ? parentId.toString() : String(parentId);
            const parent = await this.userModel.findById(parentIdString).exec();
            if (!parent) {
                throw new common_1.NotFoundException({
                    errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                    message: 'Parent not found',
                });
            }
            await this.userModel.updateOne({ _id: parent._id }, { $set: { isApproved: true } }).exec();
            await this.kidModel
                .updateMany({ parentId: parent._id }, { $set: { isApproved: true } })
                .exec();
            request.status = shared_types_1.RequestStatus.APPROVED;
            request.processedAt = new Date();
            if (actorId) {
                try {
                    if (actorId instanceof mongoose_3.Types.ObjectId) {
                        request.processedBy = actorId;
                    }
                    else if (typeof actorId === 'string' && mongoose_3.Types.ObjectId.isValid(actorId)) {
                        request.processedBy = new mongoose_3.Types.ObjectId(actorId);
                    }
                    else {
                        console.warn(`Invalid actorId format: ${actorId} (type: ${typeof actorId})`);
                    }
                }
                catch (error) {
                    console.warn(`Failed to convert actorId to ObjectId: ${error}`);
                }
            }
            await request.save();
            await this.notificationService.createNotification({
                userId: parentIdString,
                type: shared_types_1.NotificationType.REGISTRATION_APPROVED,
                title: 'Registration approved',
                body: 'Your account has been approved. You can now sign in.',
                entityType: 'UserRegistrationRequest',
                entityId: id,
            });
            await this.notificationService.sendRegistrationApproved({
                email: parent.email,
                phone: parent.phone ?? '',
                parentName: parent.parentProfile?.name,
            });
            const kids = await this.kidModel.find({ parentId: parent._id }).exec();
            await this.auditService.log({
                actorId: actorId instanceof mongoose_3.Types.ObjectId ? actorId.toString() : actorId,
                action: 'APPROVE_USER_REGISTRATION_REQUEST',
                entityType: 'UserRegistrationRequest',
                entityId: id,
                metadata: {
                    parentId: parent._id.toString(),
                    email: parent.email,
                    kidsCount: kids.length,
                },
            });
            return request;
        }
        catch (error) {
            console.error('Error approving user registration request:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException({
                errorCode: error_codes_enum_1.ErrorCode.INTERNAL_SERVER_ERROR,
                message: `Failed to approve registration: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
        }
    }
    async rejectUserRegistrationRequest(id, actorId) {
        const request = await this.userRegistrationRequestModel.findById(id).exec();
        if (!request) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.NOT_FOUND,
                message: 'User registration request not found',
            });
        }
        if (!request.parentId) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent ID not found in registration request',
            });
        }
        let parentId;
        if (request.parentId instanceof mongoose_3.Types.ObjectId) {
            parentId = request.parentId;
        }
        else if (typeof request.parentId === 'object' && request.parentId !== null) {
            parentId = request.parentId._id || request.parentId.id;
            if (!parentId) {
                throw new common_1.NotFoundException({
                    errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                    message: 'Invalid parent ID in registration request',
                });
            }
        }
        else {
            parentId = request.parentId;
        }
        const parentIdString = parentId instanceof mongoose_3.Types.ObjectId ? parentId.toString() : String(parentId);
        const parent = await this.userModel.findById(parentIdString).exec();
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        parent.status = shared_types_1.UserStatus.INACTIVE;
        await parent.save();
        const kids = await this.kidModel.find({ parentId: parent._id }).exec();
        request.status = shared_types_1.RequestStatus.DENIED;
        request.processedAt = new Date();
        if (actorId) {
            try {
                if (actorId instanceof mongoose_3.Types.ObjectId) {
                    request.processedBy = actorId;
                }
                else if (typeof actorId === 'string' && mongoose_3.Types.ObjectId.isValid(actorId)) {
                    request.processedBy = new mongoose_3.Types.ObjectId(actorId);
                }
                else {
                    console.warn(`Invalid actorId format: ${actorId} (type: ${typeof actorId})`);
                }
            }
            catch (error) {
                console.warn(`Failed to convert actorId to ObjectId: ${error}`);
            }
        }
        await request.save();
        await this.notificationService.createNotification({
            userId: parentIdString,
            type: shared_types_1.NotificationType.REGISTRATION_REJECTED,
            title: 'Registration not approved',
            body: 'Your account registration was not approved. Please contact support if you have questions.',
            entityType: 'UserRegistrationRequest',
            entityId: id,
        });
        await this.auditService.log({
            actorId: actorId instanceof mongoose_3.Types.ObjectId ? actorId.toString() : actorId,
            action: 'REJECT_USER_REGISTRATION_REQUEST',
            entityType: 'UserRegistrationRequest',
            entityId: id,
            metadata: {
                parentId: parent._id.toString(),
                email: parent.email,
                kidsCount: kids.length,
            },
        });
        return request;
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(free_session_request_schema_1.FreeSessionRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(reschedule_request_schema_1.RescheduleRequest.name)),
    __param(2, (0, mongoose_1.InjectModel)(extra_session_request_schema_1.ExtraSessionRequest.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_registration_request_schema_1.UserRegistrationRequest.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(5, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __param(6, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService,
        notifications_service_1.NotificationService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map