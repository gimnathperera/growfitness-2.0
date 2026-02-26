import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class InvoiceParentRefDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ example: 'parent@example.com' })
  email: string;
  @ApiPropertyOptional({
    description: 'Parent profile',
    example: { name: 'John', location: 'NYC' },
  })
  parentProfile?: { name: string; location?: string };
}

class InvoiceCoachRefDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ example: 'coach@example.com' })
  email: string;
  @ApiPropertyOptional({ description: 'Coach profile', example: { name: 'Jane' } })
  coachProfile?: { name: string };
}

class InvoiceItemDto {
  @ApiProperty() description: string;
  @ApiProperty({ example: 100 }) amount: number;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ enum: ['PARENT_INVOICE', 'COACH_PAYOUT'] })
  type: string;
  @ApiPropertyOptional({ description: 'Parent user ID' })
  parentId?: string;
  @ApiPropertyOptional({ description: 'Coach user ID' })
  coachId?: string;
  @ApiPropertyOptional({ description: 'Populated when parentId is expanded' })
  parent?: InvoiceParentRefDto;
  @ApiPropertyOptional({ description: 'Populated when coachId is expanded' })
  coach?: InvoiceCoachRefDto;
  @ApiProperty({ type: [InvoiceItemDto] })
  items: InvoiceItemDto[];
  @ApiProperty({ example: 500 })
  totalAmount: number;
  @ApiProperty({ enum: ['PENDING', 'PAID', 'OVERDUE'] })
  status: string;
  @ApiProperty({ example: '2024-12-31' })
  dueDate: Date;
  @ApiPropertyOptional()
  paidAt?: Date;
  @ApiPropertyOptional()
  exportFields?: Record<string, unknown>;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedInvoiceResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto], description: 'List of invoices' })
  data: InvoiceResponseDto[];
  @ApiProperty({ example: 42, description: 'Total count' })
  total: number;
  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;
  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;
  @ApiProperty({ example: 5, description: 'Total pages' })
  totalPages: number;
}
