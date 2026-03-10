import { RequestsService } from './requests.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RequestStatus, UserRole } from '@grow-fitness/shared-types';
import { CreateFreeSessionRequestDto, CreateRescheduleRequestDto, CreateExtraSessionRequestDto } from '@grow-fitness/shared-schemas';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    createFreeSessionRequest(createDto: CreateFreeSessionRequestDto): Promise<import("../../infra/database/schemas").FreeSessionRequest>;
    findFreeSessionRequests(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").FreeSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").FreeSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    selectFreeSessionRequest(id: string, sessionId: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").FreeSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").FreeSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateFreeSessionRequest(id: string, updateData: {
        status?: RequestStatus;
        selectedSessionId?: string;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").FreeSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").FreeSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteFreeSessionRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    createRescheduleRequest(createDto: CreateRescheduleRequestDto, requestedById: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").RescheduleRequestDocument, {}, {}> & import("../../infra/database/schemas").RescheduleRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    createExtraSessionRequest(createDto: CreateExtraSessionRequestDto, actorId: string, actorRole: UserRole): Promise<Omit<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ExtraSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").ExtraSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    findRescheduleRequests(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").RescheduleRequestDocument, {}, {}> & import("../../infra/database/schemas").RescheduleRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    approveRescheduleRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").RescheduleRequestDocument, {}, {}> & import("../../infra/database/schemas").RescheduleRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    denyRescheduleRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").RescheduleRequestDocument, {}, {}> & import("../../infra/database/schemas").RescheduleRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRescheduleRequest(id: string, updateData: {
        status?: RequestStatus;
        newDateTime?: string;
        reason?: string;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").RescheduleRequestDocument, {}, {}> & import("../../infra/database/schemas").RescheduleRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteRescheduleRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    findExtraSessionRequests(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ExtraSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").ExtraSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    approveExtraSessionRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ExtraSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").ExtraSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    denyExtraSessionRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ExtraSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").ExtraSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateExtraSessionRequest(id: string, updateData: {
        status?: RequestStatus;
        preferredDateTime?: string;
    }, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ExtraSessionRequestDocument, {}, {}> & import("../../infra/database/schemas").ExtraSessionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteExtraSessionRequest(id: string, actorId: string): Promise<{
        message: string;
    }>;
    findUserRegistrationRequests(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequestDocument, {}, {}> & import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    approveUserRegistrationRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequestDocument, {}, {}> & import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    rejectUserRegistrationRequest(id: string, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequestDocument, {}, {}> & import("../../infra/database/schemas/user-registration-request.schema").UserRegistrationRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
