import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserRegistrationRequestDocument } from '../../infra/database/schemas/user-registration-request.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import { CreateParentDto, UpdateParentDto, CreateCoachDto, UpdateCoachDto } from '@grow-fitness/shared-schemas';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class UsersService {
    private userModel;
    private kidModel;
    private userRegistrationRequestModel;
    private authService;
    private auditService;
    private notificationService;
    constructor(userModel: Model<UserDocument>, kidModel: Model<KidDocument>, userRegistrationRequestModel: Model<UserRegistrationRequestDocument>, authService: AuthService, auditService: AuditService, notificationService: NotificationService);
    findParents(pagination: PaginationDto, search?: string, location?: string, status?: UserStatus): Promise<PaginatedResponseDto<unknown>>;
    findParentById(id: string, includeUnapproved?: boolean): Promise<{
        kids: (import("mongoose").Document<unknown, {}, KidDocument, {}, {}> & Kid & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        role: UserRole;
        email: string;
        phone: string;
        passwordHash: string;
        status: UserStatus;
        isApproved: boolean;
        parentProfile?: {
            name: string;
            location?: string;
        };
        coachProfile?: {
            name: string;
        };
        googleCalendarRefreshToken?: string;
        googleCalendarConnectedAt?: Date;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    createParent(createParentDto: CreateParentDto, actorId: string | null): Promise<{
        kids: (import("mongoose").Document<unknown, {}, KidDocument, {}, {}> & Kid & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        role: UserRole;
        email: string;
        phone: string;
        passwordHash: string;
        status: UserStatus;
        isApproved: boolean;
        parentProfile?: {
            name: string;
            location?: string;
        };
        coachProfile?: {
            name: string;
        };
        googleCalendarRefreshToken?: string;
        googleCalendarConnectedAt?: Date;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    updateParent(id: string, updateParentDto: UpdateParentDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteParent(id: string, actorId: string): Promise<{
        message: string;
    }>;
    findCoaches(pagination: PaginationDto, search?: string): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findCoachById(id: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createCoach(createCoachDto: CreateCoachDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateCoach(id: string, updateCoachDto: UpdateCoachDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deactivateCoach(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
