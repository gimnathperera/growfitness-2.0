import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { SessionStatus } from '@grow-fitness/shared-types';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { GoogleCalendarSyncService } from '../google-calendar/google-calendar-sync.service';
export declare class SessionsService {
    private sessionModel;
    private kidModel;
    private userModel;
    private auditService;
    private notificationService;
    private googleCalendarSync;
    private logger;
    constructor(sessionModel: Model<SessionDocument>, kidModel: Model<KidDocument>, userModel: Model<UserDocument>, auditService: AuditService, notificationService: NotificationService, googleCalendarSync: GoogleCalendarSyncService);
    private toObjectId;
    private toObjectIdArray;
    private getParentIdsFromKidIds;
    findAll(pagination: PaginationDto, filters?: {
        coachId?: string;
        locationId?: string;
        kidId?: string;
        status?: SessionStatus;
        startDate?: Date;
        endDate?: Date;
        isFreeSession?: boolean;
    }): Promise<PaginatedResponseDto<{
        id: any;
        title: any;
        type: any;
        coachId: any;
        locationId: any;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        location: {
            id: any;
            name: any;
            address: any;
            geo: any;
            isActive: any;
            placeUrl: any;
        } | undefined;
        dateTime: any;
        duration: any;
        capacity: any;
        kids: any;
        status: any;
        isFreeSession: any;
        createdAt: any;
        updatedAt: any;
    }>>;
    findById(id: string): Promise<{
        id: any;
        title: any;
        type: any;
        coachId: any;
        locationId: any;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        location: {
            id: any;
            name: any;
            address: any;
            geo: any;
            isActive: any;
            placeUrl: any;
        } | undefined;
        dateTime: any;
        duration: any;
        capacity: any;
        kids: any;
        status: any;
        isFreeSession: any;
        createdAt: any;
        updatedAt: any;
    }>;
    private toSessionResponse;
    create(createSessionDto: CreateSessionDto, actorId: string): Promise<{
        id: any;
        title: any;
        type: any;
        coachId: any;
        locationId: any;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        location: {
            id: any;
            name: any;
            address: any;
            geo: any;
            isActive: any;
            placeUrl: any;
        } | undefined;
        dateTime: any;
        duration: any;
        capacity: any;
        kids: any;
        status: any;
        isFreeSession: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, updateSessionDto: UpdateSessionDto, actorId: string): Promise<{
        id: any;
        title: any;
        type: any;
        coachId: any;
        locationId: any;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        location: {
            id: any;
            name: any;
            address: any;
            geo: any;
            isActive: any;
            placeUrl: any;
        } | undefined;
        dateTime: any;
        duration: any;
        capacity: any;
        kids: any;
        status: any;
        isFreeSession: any;
        createdAt: any;
        updatedAt: any;
    }>;
    findByDateRange(startDate: Date, endDate: Date): Promise<(import("mongoose").Document<unknown, {}, SessionDocument, {}, {}> & Session & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getWeeklySummary(startDate: Date, endDate: Date): Promise<{
        total: number;
        byType: {
            INDIVIDUAL: number;
            GROUP: number;
        };
        byStatus: {
            SCHEDULED: number;
            CONFIRMED: number;
            CANCELLED: number;
            COMPLETED: number;
        };
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
