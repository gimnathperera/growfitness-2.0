import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';

@ApiTags('locations')
@ApiBearerAuth('JWT-auth')
@Controller('locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, description: 'List of locations' })
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiResponse({ status: 200, description: 'Location details' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findById(@Param('id') id: string) {
    return this.locationsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  create(@Body() createLocationDto: CreateLocationDto, @CurrentUser('sub') actorId: string) {
    return this.locationsService.create(createLocationDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.locationsService.update(id, updateLocationDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  delete(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.locationsService.delete(id, actorId);
  }
}
