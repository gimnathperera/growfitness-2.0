import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, SessionStatus } from '@grow-fitness/shared-types';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import { GetSessionsQueryDto } from './dto/get-sessions-query.dto';
import { SessionResponseDto, PaginatedSessionResponseDto } from './dto/session-response.dto';

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
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search string' })
  @ApiQuery({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: String,
    description: 'Filter by location ID',
  })
  @ApiQuery({
    name: 'kidId',
    required: false,
    type: String,
    description: 'Filter by kid ID (sessions that include this kid)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SessionStatus,
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
  @ApiOkResponse({
    description:
      'Paginated list of sessions. Each session includes coachId/locationId as IDs and optional coach/location when expanded.',
    type: PaginatedSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid query params)' })
  findAll(@Query() query: GetSessionsQueryDto) {
    const { page, limit, search, coachId, locationId, kidId, status, startDate, endDate } = query;
    return this.sessionsService.findAll(
      { page, limit, search },
      {
        coachId,
        locationId,
        kidId,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    );
  }

  @Get('free')
  @Public()
  @ApiOperation({
    summary: 'Get free sessions (public)',
    description:
      'Public endpoint. No auth required. Returns sessions where isFreeSession is true. Same filters as GET /sessions.',
  })
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
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search string' })
  @ApiQuery({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: String,
    description: 'Filter by location ID',
  })
  @ApiQuery({
    name: 'kidId',
    required: false,
    type: String,
    description: 'Filter by kid ID (sessions that include this kid)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SessionStatus,
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
  @ApiOkResponse({
    description:
      'Paginated list of free sessions (isFreeSession: true). Same filters as GET /sessions.',
    type: PaginatedSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid query params)' })
  findFreeSessions(@Query() query: GetSessionsQueryDto) {
    const { page, limit, search, coachId, locationId, kidId, status, startDate, endDate } = query;
    return this.sessionsService.findAll(
      { page, limit, search },
      {
        coachId,
        locationId,
        kidId,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isFreeSession: true,
      }
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiOkResponse({
    description: 'Session details with optional coach/location populated.',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.sessionsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Session title/name',
          example: 'Morning Training Session',
        },
        type: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'], description: 'Session type' },
        coachId: { type: 'string', description: 'Coach ID', example: '507f1f77bcf86cd799439011' },
        locationId: {
          type: 'string',
          description: 'Location ID',
          example: '507f1f77bcf86cd799439011',
        },
        dateTime: {
          type: 'string',
          format: 'date-time',
          description: 'Session date and time (ISO format)',
        },
        duration: { type: 'number', description: 'Duration in minutes', example: 60, minimum: 1 },
        capacity: {
          type: 'number',
          description: 'Maximum capacity (for group sessions)',
          example: 10,
          minimum: 1,
        },
        kids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of kid IDs (exactly one for individual sessions)',
        },
        isFreeSession: {
          type: 'boolean',
          description: 'Whether this is a free session',
          default: false,
        },
      },
      required: ['title', 'type', 'coachId', 'locationId', 'dateTime', 'duration', 'kids'],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Session created successfully. Returns session with optional coach/location populated.',
    type: SessionResponseDto,
  })
  create(@Body() createSessionDto: CreateSessionDto, @CurrentUser('sub') actorId: string) {
    return this.sessionsService.create(createSessionDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Session title/name',
          example: 'Morning Training Session',
        },
        coachId: { type: 'string', description: 'Coach ID', example: '507f1f77bcf86cd799439011' },
        locationId: {
          type: 'string',
          description: 'Location ID',
          example: '507f1f77bcf86cd799439011',
        },
        dateTime: {
          type: 'string',
          format: 'date-time',
          description: 'Session date and time (ISO format)',
          example: '2024-12-15T10:00:00.000Z',
        },
        duration: { type: 'number', description: 'Duration in minutes', example: 60, minimum: 1 },
        capacity: { type: 'number', description: 'Maximum capacity', example: 10, minimum: 1 },
        kids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of kid IDs (exactly one for individual sessions)',
          example: ['507f1f77bcf86cd799439011'],
        },
        kidId: {
          type: 'string',
          description: 'Kid ID (for individual sessions, alternative to kids array)',
          example: '507f1f77bcf86cd799439011',
        },
        status: {
          type: 'string',
          enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
          description: 'Session status',
          example: 'SCHEDULED',
        },
        isFreeSession: {
          type: 'boolean',
          description: 'Whether this is a free session',
          example: false,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Session updated. Returns session with optional coach/location populated.',
    type: SessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.sessionsService.update(id, updateSessionDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.sessionsService.delete(id, actorId);
  }
}
