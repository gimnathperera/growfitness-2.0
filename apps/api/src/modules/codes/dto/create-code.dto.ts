import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCodeDto {
  @ApiProperty({
    description: 'The code string (will be converted to uppercase)',
    example: 'SUMMER2024',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Type of code',
    example: 'DISCOUNT',
    enum: ['DISCOUNT', 'PROMOTION'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description:
      'Discount percentage (required if type is DISCOUNT and discountAmount is not provided)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @ApiProperty({
    description:
      'Discount amount (required if type is DISCOUNT and discountPercentage is not provided)',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    description: 'Expiry date of the code',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiProperty({
    description: 'Maximum number of times this code can be used',
    example: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usageLimit: number;

  @ApiProperty({
    description: 'Description of the code',
    example: 'Summer promotion code',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
