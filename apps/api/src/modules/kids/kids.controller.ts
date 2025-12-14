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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KidsService } from './kids.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { UpdateKidDto } from '@grow-fitness/shared-schemas';
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
  @ApiResponse({ status: 200, description: 'List of kids' })
  findAll(@Query() query: FindKidsQueryDto) {
    const { parentId, sessionType, ...pagination } = query;
    return this.kidsService.findAll(pagination, parentId, sessionType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kid by ID' })
  @ApiResponse({ status: 200, description: 'Kid details' })
  @ApiResponse({ status: 404, description: 'Kid not found' })
  findById(@Param('id') id: string) {
    return this.kidsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a kid' })
  @ApiResponse({ status: 200, description: 'Kid updated successfully' })
  @ApiResponse({ status: 404, description: 'Kid not found' })
  update(
    @Param('id') id: string,
    @Body() updateKidDto: UpdateKidDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.kidsService.update(id, updateKidDto, actorId);
  }

  @Post(':id/link-parent')
  @ApiOperation({ summary: 'Link kid to parent' })
  @ApiResponse({ status: 200, description: 'Kid linked to parent successfully' })
  linkToParent(
    @Param('id') kidId: string,
    @Body('parentId') parentId: string,
    @CurrentUser('sub') actorId: string
  ) {
    return this.kidsService.linkToParent(kidId, parentId, actorId);
  }

  @Delete(':id/unlink-parent')
  @ApiOperation({ summary: 'Unlink kid from parent' })
  @ApiResponse({ status: 200, description: 'Kid unlinked from parent successfully' })
  unlinkFromParent(@Param('id') kidId: string, @CurrentUser('sub') actorId: string) {
    return this.kidsService.unlinkFromParent(kidId, actorId);
  }
}
