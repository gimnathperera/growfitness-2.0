import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

export class CreateCrmContactDto {
  @ApiProperty({
    description: 'Parent ID if this contact is associated with a parent',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({
    description: 'Name of the contact',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email address of the contact',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number of the contact',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Status of the CRM contact',
    example: 'LEAD',
    enum: ['LEAD', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Source of the contact',
    example: 'WEBSITE',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    description: 'Additional metadata as key-value pairs',
    example: { notes: 'Interested in kids programs', preferredContact: 'email' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
