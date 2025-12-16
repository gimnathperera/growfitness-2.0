import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Title of the resource',
    example: 'Nutrition Guide for Kids',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the resource',
    example: 'A comprehensive guide to healthy nutrition for children',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of resource',
    example: 'ARTICLE',
    enum: ['ARTICLE', 'VIDEO', 'DOCUMENT', 'LINK'],
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Content of the resource (for articles)',
    example: 'Full article content here...',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'URL to the file (for documents/videos)',
    example: 'https://example.com/resource.pdf',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiProperty({
    description: 'External URL (for links)',
    example: 'https://example.com/article',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  externalUrl?: string;

  @ApiProperty({
    description: 'Target audience for this resource',
    example: 'PARENTS',
    enum: ['PARENTS', 'COACHES', 'KIDS', 'ALL'],
  })
  @IsString()
  targetAudience: string;

  @ApiProperty({
    description: 'Tags associated with the resource',
    example: ['nutrition', 'health', 'kids'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
