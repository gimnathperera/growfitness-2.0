import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('type') type?: InvoiceType,
    @Query('parentId') parentId?: string,
    @Query('coachId') coachId?: string,
    @Query('status') status?: InvoiceStatus
  ) {
    return this.invoicesService.findAll(pagination, { type, parentId, coachId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findById(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser('sub') actorId: string) {
    return this.invoicesService.create(createInvoiceDto, actorId);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update invoice payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvoicePaymentStatusDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.invoicesService.updatePaymentStatus(id, updateDto, actorId);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export invoices as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file download' })
  async exportCSV(
    @Res() res: Response,
    @Query('type') type?: InvoiceType,
    @Query('parentId') parentId?: string,
    @Query('coachId') coachId?: string,
    @Query('status') status?: InvoiceStatus
  ) {
    const csv = await this.invoicesService.exportCSV({ type, parentId, coachId, status });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    res.send(csv);
  }
}
