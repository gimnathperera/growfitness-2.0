import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { CrmService, CreateCrmContactDto, UpdateCrmContactDto, AddNoteDto } from './crm.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('crm')
@ApiBearerAuth('JWT-auth')
@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  @ApiOperation({ summary: 'Get all CRM contacts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of CRM contacts' })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: string, @Query('parentId') parentId?: string) {
    return this.crmService.findAll(pagination, status, parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CRM contact by ID' })
  @ApiResponse({ status: 200, description: 'CRM contact details' })
  @ApiResponse({ status: 404, description: 'CRM contact not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.crmService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new CRM contact' })
  @ApiResponse({ status: 201, description: 'CRM contact created successfully' })
  create(@Body() createCrmContactDto: CreateCrmContactDto, @CurrentUser('sub') actorId: string) {
    return this.crmService.create(createCrmContactDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a CRM contact' })
  @ApiResponse({ status: 200, description: 'CRM contact updated successfully' })
  @ApiResponse({ status: 404, description: 'CRM contact not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(@Param('id', ObjectIdValidationPipe) id: string, @Body() updateCrmContactDto: UpdateCrmContactDto, @CurrentUser('sub') actorId: string) {
    return this.crmService.update(id, updateCrmContactDto, actorId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to CRM contact' })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 404, description: 'CRM contact not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  addNote(@Param('id', ObjectIdValidationPipe) id: string, @Body() addNoteDto: AddNoteDto, @CurrentUser('sub') actorId: string) {
    return this.crmService.addNote(id, addNoteDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a CRM contact' })
  @ApiResponse({ status: 200, description: 'CRM contact deleted successfully' })
  @ApiResponse({ status: 404, description: 'CRM contact not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.crmService.delete(id, actorId);
  }
}

