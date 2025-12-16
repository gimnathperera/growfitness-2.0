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
import { BannersService } from './banners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto, CreateBannerSchema, UpdateBannerSchema } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('banners')
@ApiBearerAuth('JWT-auth')
@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all banners' })
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
  @ApiResponse({ status: 200, description: 'List of banners' })
  findAll(@Query() pagination: PaginationDto) {
    return this.bannersService.findAll(pagination);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiResponse({ status: 200, description: 'Banner details' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.bannersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', format: 'uri', description: 'Banner image URL', example: 'https://example.com/banner.jpg' },
        active: { type: 'boolean', description: 'Whether the banner is active', default: true },
        order: { type: 'number', description: 'Display order (lower numbers appear first)', example: 0, minimum: 0 },
        targetAudience: { type: 'string', enum: ['PARENT', 'COACH', 'ALL'], description: 'Target audience for the banner' },
      },
      required: ['imageUrl', 'order', 'targetAudience'],
    },
  })
  @ApiResponse({ status: 201, description: 'Banner created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body(new ZodValidationPipe(CreateBannerSchema)) createBannerDto: CreateBannerDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.bannersService.create(createBannerDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string', format: 'uri', description: 'Banner image URL' },
        active: { type: 'boolean', description: 'Whether the banner is active' },
        order: { type: 'number', description: 'Display order', minimum: 0 },
        targetAudience: { type: 'string', enum: ['PARENT', 'COACH', 'ALL'], description: 'Target audience' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Banner updated successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format or validation error' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body(new ZodValidationPipe(UpdateBannerSchema)) updateBannerDto: UpdateBannerDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.bannersService.update(id, updateBannerDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiResponse({ status: 200, description: 'Banner deleted successfully' })
  @ApiResponse({ status: 404, description: 'Banner not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.bannersService.delete(id, actorId);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder banners' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bannerIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of banner IDs in the desired order',
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        },
      },
      required: ['bannerIds'],
    },
  })
  @ApiResponse({ status: 200, description: 'Banners reordered successfully' })
  reorder(@Body() reorderDto: ReorderBannersDto, @CurrentUser('sub') actorId: string) {
    return this.bannersService.reorder(reorderDto, actorId);
  }
}
