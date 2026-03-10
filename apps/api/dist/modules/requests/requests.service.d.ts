import { Model } from 'mongoose';
import { FreeSessionRequest, FreeSessionRequestDocument } from '../../infra/database/schemas/free-session-request.schema';
import { RescheduleRequest, RescheduleRequestDocument } from '../../infra/database/schemas/reschedule-request.schema';
import { ExtraSessionRequest, ExtraSessionRequestDocument } from '../../infra/database/schemas/extra-session-request.schema';
import { CreateFreeSessionRequestDto, CreateRescheduleRequestDto, CreateExtraSessionRequestDto } from '@grow-fitness/shared-schemas';
import { UserRegistrationRequest, UserRegistrationRequestDocument } from '../../infra/database/schemas/user-registration-request.schema';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { SessionDocument } from '../../infra/database/schemas/session.schema';
import { RequestStatus, UserRole } from '@grow-fitness/shared-types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Types } from 'mongoose';
export declare class RequestsService {
    private freeSessionRequestModel;
    private rescheduleRequestModel;
    private extraSessionRequestModel;
    private userRegistrationRequestModel;
    private userModel;
    private kidModel;
    private sessionModel;
    private auditService;
    private notificationService;
    constructor(freeSessionRequestModel: Model<FreeSessionRequestDocument>, rescheduleRequestModel: Model<RescheduleRequestDocument>, extraSessionRequestModel: Model<ExtraSessionRequestDocument>, userRegistrationRequestModel: Model<UserRegistrationRequestDocument>, userModel: Model<UserDocument>, kidModel: Model<KidDocument>, sessionModel: Model<SessionDocument>, auditService: AuditService, notificationService: NotificationService);
    private notifyAdmins;
    createFreeSessionRequest(data: CreateFreeSessionRequestDto): Promise<FreeSessionRequest>;
    findFreeSessionRequests(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, FreeSessionRequestDocument, {}, {}> & FreeSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    countFreeSessionRequests(): Promise<number>;
    selectFreeSessionRequest(id: string, actorId: string, sessionId?: string): Promise<import("mongoose").Document<unknown, {}, FreeSessionRequestDocument, {}, {}> & FreeSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createRescheduleRequest(dto: CreateRescheduleRequestDto, requestedById: string): Promise<Omit<import("mongoose").Document<unknown, {}, RescheduleRequestDocument, {}, {}> & RescheduleRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    findRescheduleRequests(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, RescheduleRequestDocument, {}, {}> & RescheduleRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    countRescheduleRequests(): Promise<number>;
    approveRescheduleRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, RescheduleRequestDocument, {}, {}> & RescheduleRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    denyRescheduleRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, RescheduleRequestDocument, {}, {}> & RescheduleRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createExtraSessionRequest(dto: CreateExtraSessionRequestDto, actorId: string, actorRole: UserRole): Promise<Omit<import("mongoose").Document<unknown, {}, ExtraSessionRequestDocument, {}, {}> & ExtraSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    findExtraSessionRequests(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, ExtraSessionRequestDocument, {}, {}> & ExtraSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    approveExtraSessionRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, ExtraSessionRequestDocument, {}, {}> & ExtraSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    denyExtraSessionRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, ExtraSessionRequestDocument, {}, {}> & ExtraSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteFreeSessionRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    deleteRescheduleRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    deleteExtraSessionRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    updateFreeSessionRequest(id: string, updateData: {
        status?: RequestStatus;
        selectedSessionId?: string;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, FreeSessionRequestDocument, {}, {}> & FreeSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRescheduleRequest(id: string, updateData: {
        status?: RequestStatus;
        newDateTime?: Date;
        reason?: string;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, RescheduleRequestDocument, {}, {}> & RescheduleRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateExtraSessionRequest(id: string, updateData: {
        status?: RequestStatus;
        preferredDateTime?: Date;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, ExtraSessionRequestDocument, {}, {}> & ExtraSessionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findUserRegistrationRequests(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, UserRegistrationRequestDocument, {}, {}> & UserRegistrationRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    approveUserRegistrationRequest(id: string, actorId: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, UserRegistrationRequestDocument, {}, {}> & UserRegistrationRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    rejectUserRegistrationRequest(id: string, actorId: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, UserRegistrationRequestDocument, {}, {}> & UserRegistrationRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
