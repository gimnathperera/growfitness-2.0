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
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';

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
  @ApiResponse({ status: 200, description: 'List of parents' })
  findParents(@Query() pagination: PaginationDto, @Query('search') search?: string) {
    return this.usersService.findParents(pagination, search);
  }

  @Get('parents/:id')
  findParentById(@Param('id') id: string) {
    return this.usersService.findParentById(id);
  }

  @Post('parents')
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
  createParent(@Body() createParentDto: CreateParentDto, @CurrentUser('sub') actorId: string) {
    return this.usersService.createParent(createParentDto, actorId);
  }

  @Patch('parents/:id')
  updateParent(
    @Param('id') id: string,
    @Body() updateParentDto: UpdateParentDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.updateParent(id, updateParentDto, actorId);
  }

  @Delete('parents/:id')
  deleteParent(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
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
  findCoachById(@Param('id') id: string) {
    return this.usersService.findCoachById(id);
  }

  @Post('coaches')
  createCoach(@Body() createCoachDto: CreateCoachDto, @CurrentUser('sub') actorId: string) {
    return this.usersService.createCoach(createCoachDto, actorId);
  }

  @Patch('coaches/:id')
  updateCoach(
    @Param('id') id: string,
    @Body() updateCoachDto: UpdateCoachDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.usersService.updateCoach(id, updateCoachDto, actorId);
  }

  @Delete('coaches/:id')
  deactivateCoach(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.usersService.deactivateCoach(id, actorId);
  }
}
