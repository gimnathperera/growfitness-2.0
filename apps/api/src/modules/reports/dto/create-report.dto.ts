import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: 'Type of report',
    example: 'ATTENDANCE',
    enum: ['ATTENDANCE', 'REVENUE', 'USER_ACTIVITY', 'SESSION_STATISTICS'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Title of the report',
    example: 'Monthly Attendance Report - January 2024',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the report',
    example: 'Monthly attendance statistics for all sessions',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Start date for the report period',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({
    description: 'End date for the report period',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'Additional filters for the report',
    example: { locationId: '507f1f77bcf86cd799439011', sessionType: 'GROUP' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}
