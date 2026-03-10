import { NotificationService } from './notifications.service';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    findAll(user: JwtPayload, pagination: PaginationDto, read?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("../../infra/database/schemas/notification.schema").NotificationDocument>>;
    getUnreadCount(user: JwtPayload): Promise<{
        count: number;
    }>;
    markAllAsRead(user: JwtPayload): Promise<{
        count: number;
    }>;
    clearAll(user: JwtPayload): Promise<{
        deletedCount: number;
    }>;
    deleteOne(id: string, user: JwtPayload): Promise<void>;
    markAsRead(id: string, user: JwtPayload): Promise<import("../../infra/database/schemas/notification.schema").NotificationDocument>;
}
