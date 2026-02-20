import { Controller, Get, Patch, Delete, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import {
  NotificationResponseDto,
  UnreadCountResponseDto,
  MarkAllReadResponseDto,
  PaginatedNotificationsResponseDto,
  ClearAllResponseDto,
} from './dto/notification-response.dto';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'read', required: false, type: Boolean, description: 'Filter by read status (true/false)' })
  @ApiOkResponse({
    description: 'Paginated list of notifications for the authenticated user',
    type: PaginatedNotificationsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
    @Query('read') read?: string
  ) {
    const filter =
      read !== undefined ? { read: read === 'true' } : undefined;
    return this.notificationService.findAllForUser(user.sub, pagination, filter);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiOkResponse({
    description: 'Unread notification count (e.g. for badge)',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getUnreadCount(user.sub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiOkResponse({
    description: 'Number of notifications marked as read',
    type: MarkAllReadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.sub);
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Clear all notifications for current user' })
  @ApiOkResponse({
    description: 'Number of notifications deleted',
    type: ClearAllResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  clearAll(@CurrentUser() user: JwtPayload) {
    return this.notificationService.deleteAll(user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear a single notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to user' })
  @ApiResponse({ status: 400, description: 'Invalid notification ID format' })
  deleteOne(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.notificationService.deleteOne(id, user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiOkResponse({
    description: 'The notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing JWT' })
  @ApiResponse({ status: 404, description: 'Notification not found or does not belong to user' })
  @ApiResponse({ status: 400, description: 'Invalid notification ID format' })
  markAsRead(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.notificationService.markAsRead(id, user.sub);
  }
}
