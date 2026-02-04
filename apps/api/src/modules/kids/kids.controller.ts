import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { KidsService } from './kids.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, SessionType } from '@grow-fitness/shared-types';
import { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';
import { FindKidsQueryDto } from './dto/find-kids-query.dto';

@ApiTags('kids')
@ApiBearerAuth('JWT-auth')
@Controller('kids')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all kids' })
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
  @ApiQuery({ name: 'parentId', required: false, type: String, description: 'Filter by parent ID' })
  @ApiQuery({
    name: 'sessionType',
    required: false,
    enum: ['INDIVIDUAL', 'GROUP'],
    description: 'Filter by session type',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name or goal',
  })
  @ApiResponse({ status: 200, description: 'List of kids' })
  findAll(@Query() query: FindKidsQueryDto) {
    const { parentId, sessionType, search, ...pagination } = query;
    return this.kidsService.findAll(pagination, parentId, sessionType, search);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new kid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Kid full name', example: 'Emma Smith' },
        gender: { type: 'string', description: 'Kid gender', example: 'Female' },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'Birth date (ISO format)',
          example: '2015-05-15',
        },
        goal: {
          type: 'string',
          description: 'Fitness goal (optional)',
          example: 'Improve flexibility and strength',
        },
        currentlyInSports: {
          type: 'boolean',
          description: 'Whether kid is currently in sports',
          example: true,
        },
        medicalConditions: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of medical conditions (optional)',
          example: ['Asthma'],
        },
        sessionType: {
          type: 'string',
          enum: ['INDIVIDUAL', 'GROUP'],
          description: 'Preferred session type',
          example: 'INDIVIDUAL',
        },
        parentId: {
          type: 'string',
          description: 'Parent ID (MongoDB ObjectId)',
          example: '507f1f77bcf86cd799439011',
        },
      },
      required: ['name', 'gender', 'birthDate', 'currentlyInSports', 'sessionType', 'parentId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Kid created successfully' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() createKidDto: CreateKidDto, @CurrentUser('sub') actorId: string) {
    return this.kidsService.create(createKidDto, actorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kid by ID' })
  @ApiResponse({ status: 200, description: 'Kid details' })
  @ApiResponse({ status: 404, description: 'Kid not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.kidsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a kid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Kid full name' },
        gender: { type: 'string', description: 'Kid gender' },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'Birth date (ISO format)',
        },
        goal: {
          type: 'string',
          description: 'Fitness goal',
        },
        currentlyInSports: {
          type: 'boolean',
          description: 'Whether kid is currently in sports',
        },
        medicalConditions: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of medical conditions',
        },
        sessionType: {
          type: 'string',
          enum: ['INDIVIDUAL', 'GROUP'],
          description: 'Preferred session type',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Kid updated successfully' })
  @ApiResponse({ status: 404, description: 'Kid not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateKidDto: UpdateKidDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.kidsService.update(id, updateKidDto, actorId);
  }

  @Post(':id/link-parent')
  @ApiOperation({ summary: 'Link kid to parent' })
  @ApiResponse({ status: 200, description: 'Kid linked to parent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  linkToParent(
    @Param('id', ObjectIdValidationPipe) kidId: string,
    @Body('parentId', ObjectIdValidationPipe) parentId: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.kidsService.linkToParent(kidId, parentId, actorId);
  }

  @Delete(':id/unlink-parent')
  @ApiOperation({ summary: 'Unlink kid from parent' })
  @ApiResponse({ status: 200, description: 'Kid unlinked from parent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  unlinkFromParent(
    @Param('id', ObjectIdValidationPipe) kidId: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.kidsService.unlinkFromParent(kidId, actorId);
  }
}
