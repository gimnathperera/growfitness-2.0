import { UsersService } from './users.service';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import { CreateParentDto, UpdateParentDto, CreateCoachDto, UpdateCoachDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { GetParentsQueryDto } from './dto/get-parents-query.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findParents(query: GetParentsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<unknown>>;
    findParentById(id: string, includeUnapproved?: string): Promise<{
        kids: (import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").KidDocument, {}, {}> & import("../../infra/database/schemas").Kid & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
        _id: import("mongoose").Types.ObjectId;
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
    createParent(createParentDto: CreateParentDto, user?: any): Promise<{
        kids: (import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").KidDocument, {}, {}> & import("../../infra/database/schemas").Kid & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
        _id: import("mongoose").Types.ObjectId;
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
    updateParent(id: string, updateParentDto: UpdateParentDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").UserDocument, {}, {}> & import("../../infra/database/schemas").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteParent(id: string, actorId: string): Promise<{
        message: string;
    }>;
    findCoaches(pagination: PaginationDto, search?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").UserDocument, {}, {}> & import("../../infra/database/schemas").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findCoachById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").UserDocument, {}, {}> & import("../../infra/database/schemas").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createCoach(createCoachDto: CreateCoachDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").UserDocument, {}, {}> & import("../../infra/database/schemas").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateCoach(id: string, updateCoachDto: UpdateCoachDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").UserDocument, {}, {}> & import("../../infra/database/schemas").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deactivateCoach(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
