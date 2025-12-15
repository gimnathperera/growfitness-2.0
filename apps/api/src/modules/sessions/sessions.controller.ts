import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, SessionStatus } from '@grow-fitness/shared-types';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('sessions')
@ApiBearerAuth('JWT-auth')
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions' })
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
  @ApiQuery({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: String,
    description: 'Filter by location ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    description: 'Filter by session status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter sessions from this date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter sessions until this date (ISO format)',
  })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('coachId') coachId?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: SessionStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.sessionsService.findAll(pagination, {
      coachId,
      locationId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiResponse({ status: 200, description: 'Session details' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.sessionsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  create(@Body() createSessionDto: CreateSessionDto, @CurrentUser('sub') actorId: string) {
    return this.sessionsService.create(createSessionDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.sessionsService.update(id, updateSessionDto, actorId);
  }
}
