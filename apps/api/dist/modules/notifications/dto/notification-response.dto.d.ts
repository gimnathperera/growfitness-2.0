import { NotificationType } from '@grow-fitness/shared-types';
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    entityType?: string;
    entityId?: string;
    createdAt: string;
}
export declare class UnreadCountResponseDto {
    count: number;
}
export declare class MarkAllReadResponseDto {
    count: number;
}
export declare class ClearAllResponseDto {
    deletedCount: number;
}
export declare class PaginatedNotificationsResponseDto {
    data: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
