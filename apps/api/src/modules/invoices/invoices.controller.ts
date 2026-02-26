import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { GetInvoicesQueryDto } from './dto/get-invoices-query.dto';
import { InvoiceResponseDto, PaginatedInvoiceResponseDto } from './dto/invoice-response.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiOkResponse({
    description:
      'Paginated list of invoices. Each invoice includes parentId/coachId as IDs and optional parent/coach when expanded.',
    type: PaginatedInvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error (e.g. invalid query params)' })
  findAll(@Query() query: GetInvoicesQueryDto) {
    const { page, limit, type, parentId, coachId, status } = query;
    return this.invoicesService.findAll({ page, limit }, { type, parentId, coachId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiOkResponse({
    description: 'Invoice details with optional parent/coach populated.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.invoicesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['PARENT_INVOICE', 'COACH_PAYOUT'],
          description: 'Invoice type',
          example: 'PARENT_INVOICE',
        },
        parentId: {
          type: 'string',
          description: 'Parent ID (required for PARENT_INVOICE, MongoDB ObjectId)',
          example: '507f1f77bcf86cd799439011',
        },
        coachId: {
          type: 'string',
          description: 'Coach ID (required for COACH_PAYOUT, MongoDB ObjectId)',
          example: '507f1f77bcf86cd799439011',
        },
        items: {
          type: 'array',
          description: 'Invoice line items',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Item description',
                example: 'Monthly training sessions',
              },
              amount: {
                type: 'number',
                description: 'Item amount (must be >= 0)',
                example: 500.0,
                minimum: 0,
              },
            },
            required: ['description', 'amount'],
          },
          example: [
            { description: 'Monthly training sessions', amount: 500.0 },
            { description: 'Equipment fee', amount: 50.0 },
          ],
        },
        dueDate: {
          type: 'string',
          format: 'date',
          description: 'Due date (ISO format)',
          example: '2024-12-31',
        },
      },
      required: ['type', 'items', 'dueDate'],
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Invoice created successfully. Returns invoice with optional parent/coach populated.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Parent or Coach not found' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser('sub') actorId: string) {
    return this.invoicesService.create(createInvoiceDto, actorId);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ summary: 'Update invoice payment status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PAID', 'OVERDUE'],
          description: 'Payment status',
          example: 'PAID',
        },
        paidAt: {
          type: 'string',
          format: 'date-time',
          description: 'Payment date/time (ISO format, optional, required when status is PAID)',
          example: '2024-12-15T10:30:00Z',
        },
      },
      required: ['status'],
    },
  })
  @ApiOkResponse({
    description: 'Payment status updated. Returns invoice with optional parent/coach populated.',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  updatePaymentStatus(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateDto: UpdateInvoicePaymentStatusDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.invoicesService.updatePaymentStatus(id, updateDto, actorId);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export invoices as CSV' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['PARENT_INVOICE', 'COACH_PAYOUT'],
    description: 'Filter by invoice type',
  })
  @ApiQuery({ name: 'parentId', required: false, type: String, description: 'Filter by parent ID' })
  @ApiQuery({ name: 'coachId', required: false, type: String, description: 'Filter by coach ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'PAID', 'OVERDUE'],
    description: 'Filter by invoice status',
  })
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
