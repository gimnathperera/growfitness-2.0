import { IsOptional, IsBooleanString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetTestimonialsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'If true, return only active testimonials. Use "false" to include inactive. Default: true.',
    type: String,
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  activeOnly?: string;
}
