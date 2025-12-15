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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('locations')
@ApiBearerAuth('JWT-auth')
@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all locations' })
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
  @ApiResponse({ status: 200, description: 'List of locations' })
  findAll(@Query() pagination: PaginationDto) {
    return this.locationsService.findAll(pagination);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location details' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.locationsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Location name', example: 'Main Gym' },
        address: { type: 'string', description: 'Full address', example: '123 Main St, City, State 12345' },
        geo: {
          type: 'object',
          properties: {
            lat: { type: 'number', description: 'Latitude', example: 40.7128 },
            lng: { type: 'number', description: 'Longitude', example: -74.0060 },
          },
          description: 'Geographic coordinates (optional)',
        },
      },
      required: ['name', 'address'],
    },
  })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  create(@Body() createLocationDto: CreateLocationDto, @CurrentUser('sub') actorId: string) {
    return this.locationsService.create(createLocationDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Location name' },
        address: { type: 'string', description: 'Full address' },
        geo: {
          type: 'object',
          properties: {
            lat: { type: 'number', description: 'Latitude' },
            lng: { type: 'number', description: 'Longitude' },
          },
        },
        isActive: { type: 'boolean', description: 'Whether the location is active' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.locationsService.update(id, updateLocationDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.locationsService.delete(id, actorId);
  }
}
