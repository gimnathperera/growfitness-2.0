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
import { IsOptional, IsString, IsEnum } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

import { GetParentsQueryDto } from './dto/get-parents-query.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Parents
  @Get('parents')
  @ApiOperation({ summary: 'Get all parents' })
  @ApiResponse({ status: 200, description: 'List of parents' })
  findParents(@Query() query: GetParentsQueryDto) {
    return this.usersService.findParents(query, query.search, query.location, query.status);
  }

  @Get('parents/:id')
  @ApiOperation({ summary: 'Get parent by ID' })
  @ApiQuery({
    name: 'includeUnapproved',
    required: false,
    type: Boolean,
    description: 'Include unapproved parents (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Parent details' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findParentById(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Query('includeUnapproved') includeUnapproved?: string
  ) {
    return this.usersService.findParentById(id, includeUnapproved === 'true');
  }

  @Post('parents')
  @Public()
  @ApiOperation({ summary: 'Create a new parent' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        location: { type: 'string' },
        password: { type: 'string', minLength: 6 },
        kids: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              gender: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              goal: { type: 'string' },
              currentlyInSports: { type: 'boolean' },
              medicalConditions: { type: 'array', items: { type: 'string' } },
              sessionType: { type: 'string', enum: ['INDIVIDUAL', 'GROUP'] },
            },
          },
        },
      },
      required: ['name', 'email', 'phone', 'password', 'kids'],
    },
  })
  @ApiResponse({ status: 201, description: 'Parent created successfully' })
  createParent(@Body() createParentDto: CreateParentDto, @CurrentUser() user?: any) {
    // If user is authenticated (admin creating from portal), use their ID
    // If no user (public registration), pass null to require approval
    const actorId = user?.sub || user?.id || null;
    return this.usersService.createParent(createParentDto, actorId);
  }

  @Patch('parents/:id')
  @ApiOperation({ summary: 'Update parent' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Parent full name' },
        email: { type: 'string', format: 'email', description: 'Parent email address' },
        phone: { type: 'string', description: 'Parent phone number' },
        location: { type: 'string', description: 'Parent location' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
          description: 'Parent status',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Parent updated successfully' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  updateParent(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateParentDto: UpdateParentDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.updateParent(id, updateParentDto, actorId);
  }

  @Delete('parents/:id')
  @ApiOperation({ summary: 'Delete parent' })
  @ApiResponse({ status: 200, description: 'Parent deleted successfully' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  deleteParent(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.deleteParent(id, actorId);
  }

  // Coaches
  @Get('coaches')
  @ApiOperation({ summary: 'Get all coaches' })
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by email, phone, or name',
  })
  @ApiResponse({ status: 200, description: 'List of coaches' })
  findCoaches(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.usersService.findCoaches(pagination, search);
  }

  @Get('coaches/:id')
  @ApiOperation({ summary: 'Get coach by ID' })
  @ApiResponse({ status: 200, description: 'Coach details' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findCoachById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.usersService.findCoachById(id);
  }

  @Post('coaches')
  @ApiOperation({ summary: 'Create a new coach' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Coach full name', example: 'John Doe' },
        email: {
          type: 'string',
          format: 'email',
          description: 'Coach email address',
          example: 'john.doe@example.com',
        },
        phone: { type: 'string', description: 'Coach phone number', example: '+1234567890' },
        password: {
          type: 'string',
          minLength: 6,
          description: 'Password (minimum 6 characters)',
          example: 'password123',
        },
      },
      required: ['name', 'email', 'phone', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Coach created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createCoach(@Body() createCoachDto: CreateCoachDto, @CurrentUser('sub') actorId: string) {
    return this.usersService.createCoach(createCoachDto, actorId);
  }

  @Patch('coaches/:id')
  @ApiOperation({ summary: 'Update coach' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Coach full name' },
        email: { type: 'string', format: 'email', description: 'Coach email address' },
        phone: { type: 'string', description: 'Coach phone number' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Coach status' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Coach updated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  updateCoach(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateCoachDto: UpdateCoachDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.updateCoach(id, updateCoachDto, actorId);
  }

  @Delete('coaches/:id')
  @ApiOperation({ summary: 'Deactivate coach' })
  @ApiResponse({ status: 200, description: 'Coach deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  deactivateCoach(
    @Param('id', ObjectIdValidationPipe) id: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.deactivateCoach(id, actorId);
  }
}
