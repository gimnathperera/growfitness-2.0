import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from '@grow-fitness/shared-schemas';

@ApiTags('banners')
@ApiBearerAuth('JWT-auth')
@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, description: 'List of banners' })
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiResponse({ status: 200, description: 'Banner details' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  findById(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiResponse({ status: 201, description: 'Banner created successfully' })
  create(@Body() createBannerDto: CreateBannerDto, @CurrentUser('sub') actorId: string) {
    return this.bannersService.create(createBannerDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner' })
  @ApiResponse({ status: 200, description: 'Banner updated successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.bannersService.update(id, updateBannerDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  delete(@Param('id') id: string, @CurrentUser('sub') actorId: string) {
    return this.bannersService.delete(id, actorId);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder banners' })
  @ApiResponse({ status: 200, description: 'Banners reordered successfully' })
  reorder(@Body() reorderDto: ReorderBannersDto, @CurrentUser('sub') actorId: string) {
    return this.bannersService.reorder(reorderDto, actorId);
  }
}
