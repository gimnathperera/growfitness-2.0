import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { ResourcesService, CreateResourceDto, UpdateResourceDto } from './resources.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('resources')
@ApiBearerAuth('JWT-auth')
@Controller('resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'targetAudience', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of resources' })
  findAll(@Query() pagination: PaginationDto, @Query('targetAudience') targetAudience?: string) {
    return this.resourcesService.findAll(pagination, targetAudience);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource details' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.resourcesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  create(@Body() createResourceDto: CreateResourceDto, @CurrentUser('sub') actorId: string) {
    return this.resourcesService.create(createResourceDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a resource' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(@Param('id', ObjectIdValidationPipe) id: string, @Body() updateResourceDto: UpdateResourceDto, @CurrentUser('sub') actorId: string) {
    return this.resourcesService.update(id, updateResourceDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.resourcesService.delete(id, actorId);
  }
}

