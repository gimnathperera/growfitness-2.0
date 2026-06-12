import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';

export enum InvoicePdfSentFilter {
  SENT = 'sent',
  NOT_SENT = 'not_sent',
}

export const INVOICE_SORT_FIELDS = [
  'type',
  'recipient',
  'totalAmount',
  'status',
  'pdfEmailedAt',
  'dueDate',
  'createdAt',
] as const;
export type InvoiceSortField = (typeof INVOICE_SORT_FIELDS)[number];

export class GetInvoicesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: InvoiceType, description: 'Filter by invoice type' })
  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType;

  @ApiPropertyOptional({ description: 'Filter by parent ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Filter by coach ID' })
  @IsOptional()
  @IsString()
  coachId?: string;

  @ApiPropertyOptional({ enum: InvoiceStatus, description: 'Filter by invoice status' })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({
    enum: InvoicePdfSentFilter,
    description: 'Filter by whether the invoice PDF was emailed to the recipient',
  })
  @IsOptional()
  @IsEnum(InvoicePdfSentFilter)
  pdfSent?: InvoicePdfSentFilter;

  @ApiPropertyOptional({ enum: INVOICE_SORT_FIELDS, description: 'Field to sort invoices by' })
  @IsOptional()
  @IsIn(INVOICE_SORT_FIELDS)
  sortBy?: InvoiceSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Invoice sort direction' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
