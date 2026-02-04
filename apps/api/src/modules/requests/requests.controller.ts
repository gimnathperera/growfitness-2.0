import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import { RequestStatus } from '@grow-fitness/shared-types';
import { CreateFreeSessionRequestDto } from '@grow-fitness/shared-schemas';

@ApiTags('requests')
@ApiBearerAuth('JWT-auth')
@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('free-sessions')
  @Public()
  @ApiOperation({ summary: 'Create a free session request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentName: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '1234567890' },
        email: { type: 'string', example: 'john@example.com' },
        kidName: { type: 'string', example: 'Jane Doe' },
        sessionType: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'] },
        selectedSessionId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        locationId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        preferredDateTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Free session request created successfully' })
  createFreeSessionRequest(@Body() createDto: CreateFreeSessionRequestDto) {
    return this.requestsService.createFreeSessionRequest(createDto);
  }

  @Get('free-sessions')
  @Public()
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: {
          type: 'string',
          description: 'Session ID to select (optional)',
          example: '507f1f77bcf86cd799439011',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Free session request selected successfully' })
  selectFreeSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body('sessionId') sessionId: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.selectFreeSessionRequest(id, actorId, sessionId);
  }

  @Patch('free-sessions/:id')
  @ApiOperation({ summary: 'Update a free session request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'SELECTED', 'DENIED'],
          description: 'Request status',
        },
        selectedSessionId: { type: 'string', description: 'Selected session ID' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Free session request updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  updateFreeSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateData: { status?: RequestStatus; selectedSessionId?: string },
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.updateFreeSessionRequest(id, updateData, actorId);
  }

  @Delete('free-sessions/:id')
  @ApiOperation({ summary: 'Delete a free session request' })
  @ApiResponse({ status: 200, description: 'Free session request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  deleteFreeSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.deleteFreeSessionRequest(id, actorId);
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
  denyRescheduleRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.denyRescheduleRequest(id, actorId);
  }

  @Patch('reschedules/:id')
  @ApiOperation({ summary: 'Update a reschedule request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'DENIED'],
          description: 'Request status',
        },
        newDateTime: {
          type: 'string',
          format: 'date-time',
          description: 'New date and time (ISO format)',
        },
        reason: { type: 'string', description: 'Reason for reschedule' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Reschedule request updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  updateRescheduleRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateData: { status?: RequestStatus; newDateTime?: string; reason?: string },
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.updateRescheduleRequest(
      id,
      {
        ...updateData,
        newDateTime: updateData.newDateTime ? new Date(updateData.newDateTime) : undefined,
      },
      actorId
    );
  }

  @Delete('reschedules/:id')
  @ApiOperation({ summary: 'Delete a reschedule request' })
  @ApiResponse({ status: 200, description: 'Reschedule request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  deleteRescheduleRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.deleteRescheduleRequest(id, actorId);
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
  denyExtraSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.denyExtraSessionRequest(id, actorId);
  }

  @Patch('extra-sessions/:id')
  @ApiOperation({ summary: 'Update an extra session request' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'APPROVED', 'DENIED'],
          description: 'Request status',
        },
        preferredDateTime: {
          type: 'string',
          format: 'date-time',
          description: 'Preferred date and time (ISO format)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Extra session request updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  updateExtraSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateData: { status?: RequestStatus; preferredDateTime?: string },
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.updateExtraSessionRequest(
      id,
      {
        ...updateData,
        preferredDateTime: updateData.preferredDateTime
          ? new Date(updateData.preferredDateTime)
          : undefined,
      },
      actorId
    );
  }

  @Delete('extra-sessions/:id')
  @ApiOperation({ summary: 'Delete an extra session request' })
  @ApiResponse({ status: 200, description: 'Extra session request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  deleteExtraSessionRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.deleteExtraSessionRequest(id, actorId);
  }

  @Get('user-registrations')
  @ApiOperation({ summary: 'Get all user registration requests' })
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
  @ApiResponse({ status: 200, description: 'List of user registration requests' })
  findUserRegistrationRequests(@Query() pagination: PaginationDto) {
    return this.requestsService.findUserRegistrationRequests(pagination);
  }

  @Post('user-registrations/:id/approve')
  @ApiOperation({ summary: 'Approve a user registration request' })
  @ApiResponse({ status: 200, description: 'User registration request approved successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  approveUserRegistrationRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.approveUserRegistrationRequest(id, actorId);
  }

  @Post('user-registrations/:id/reject')
  @ApiOperation({ summary: 'Reject a user registration request' })
  @ApiResponse({ status: 200, description: 'User registration request rejected successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  rejectUserRegistrationRequest(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.requestsService.rejectUserRegistrationRequest(id, actorId);
  }
}
