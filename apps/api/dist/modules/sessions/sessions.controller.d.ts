import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { GetSessionsQueryDto } from './dto/get-sessions-query.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    findAll(query: GetSessionsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<{
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
    findFreeSessions(query: GetSessionsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<{
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
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
