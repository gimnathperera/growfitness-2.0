import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CodesService, CreateCodeDto, UpdateCodeDto } from './codes.service';
import { CreateCodeDto as CreateCodeDtoClass } from './dto/create-code.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('codes')
@ApiBearerAuth('JWT-auth')
@Controller('codes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all codes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of codes' })
  findAll(@Query() pagination: PaginationDto) {
    return this.codesService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get code by ID' })
  @ApiResponse({ status: 200, description: 'Code details' })
  @ApiResponse({ status: 404, description: 'Code not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.codesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new code' })
  @ApiBody({ type: CreateCodeDtoClass })
  @ApiResponse({ status: 201, description: 'Code created successfully' })
  create(@Body() createCodeDto: CreateCodeDto, @CurrentUser('sub') actorId: string) {
    return this.codesService.create(createCodeDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a code' })
  @ApiResponse({ status: 200, description: 'Code updated successfully' })
  @ApiResponse({ status: 404, description: 'Code not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateCodeDto: UpdateCodeDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.codesService.update(id, updateCodeDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a code' })
  @ApiResponse({ status: 200, description: 'Code deleted successfully' })
  @ApiResponse({ status: 404, description: 'Code not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.codesService.delete(id, actorId);
  }
}
