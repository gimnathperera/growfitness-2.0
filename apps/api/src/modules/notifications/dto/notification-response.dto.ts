import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@grow-fitness/shared-types';

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'Recipient user ID' })
  userId: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  type: NotificationType;

  @ApiProperty({ description: 'Short title' })
  title: string;

  @ApiProperty({ description: 'Notification body' })
  body: string;

  @ApiProperty({ description: 'Whether the notification has been read' })
  read: boolean;

  @ApiPropertyOptional({ description: 'Related entity type (e.g. Session, RescheduleRequest)' })
  entityType?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  entityId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;
}

export class UnreadCountResponseDto {
  @ApiProperty({ description: 'Number of unread notifications', example: 5 })
  count: number;
}

export class MarkAllReadResponseDto {
  @ApiProperty({ description: 'Number of notifications marked as read', example: 3 })
  count: number;
}

export class ClearAllResponseDto {
  @ApiProperty({ description: 'Number of notifications deleted', example: 5 })
  deletedCount: number;
}

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationResponseDto], description: 'List of notifications' })
  data: NotificationResponseDto[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}
