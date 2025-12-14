import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('requests')
@ApiBearerAuth('JWT-auth')
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get('free-sessions')
  @ApiOperation({ summary: 'Get all free session requests' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'List of free session requests' })
  findFreeSessionRequests(@Query() pagination: PaginationDto) {
    return this.requestsService.findFreeSessionRequests(pagination);
  }

  @Post('free-sessions/:id/select')
  @ApiOperation({ summary: 'Select a free session request' })
  @ApiResponse({ status: 200, description: 'Free session request selected successfully' })
  selectFreeSessionRequest(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.requestsService.selectFreeSessionRequest(id, actorId);
  }

  @Get('reschedules')
  @ApiOperation({ summary: 'Get all reschedule requests' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'List of reschedule requests' })
  findRescheduleRequests(@Query() pagination: PaginationDto) {
    return this.requestsService.findRescheduleRequests(pagination);
  }

  @Post('reschedules/:id/approve')
  @ApiOperation({ summary: 'Approve a reschedule request' })
  @ApiResponse({ status: 200, description: 'Reschedule request approved successfully' })
  approveRescheduleRequest(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.requestsService.approveRescheduleRequest(id, actorId);
  }

  @Post('reschedules/:id/deny')
  @ApiOperation({ summary: 'Deny a reschedule request' })
  @ApiResponse({ status: 200, description: 'Reschedule request denied successfully' })
  denyRescheduleRequest(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.requestsService.denyRescheduleRequest(id, actorId);
  }

  @Get('extra-sessions')
  @ApiOperation({ summary: 'Get all extra session requests' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'List of extra session requests' })
  findExtraSessionRequests(@Query() pagination: PaginationDto) {
    return this.requestsService.findExtraSessionRequests(pagination);
  }

  @Post('extra-sessions/:id/approve')
  @ApiOperation({ summary: 'Approve an extra session request' })
  @ApiResponse({ status: 200, description: 'Extra session request approved successfully' })
  approveExtraSessionRequest(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.requestsService.approveExtraSessionRequest(id, actorId);
  }

  @Post('extra-sessions/:id/deny')
  @ApiOperation({ summary: 'Deny an extra session request' })
  @ApiResponse({ status: 200, description: 'Extra session request denied successfully' })
  denyExtraSessionRequest(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.requestsService.denyExtraSessionRequest(id, actorId);
  }
}
