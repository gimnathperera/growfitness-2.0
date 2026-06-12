import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const REQUEST_SORT_FIELDS = [
  'parentName',
  'kidName',
  'email',
  'phone',
  'preferredDateTime',
  'sessionId',
  'newDateTime',
  'reason',
  'parent',
  'kid',
  'coach',
  'sessionType',
  'status',
  'createdAt',
] as const;
export type RequestSortField = (typeof REQUEST_SORT_FIELDS)[number];

export class ListRequestsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: REQUEST_SORT_FIELDS, description: 'Field to sort requests by' })
  @IsOptional()
  @IsIn(REQUEST_SORT_FIELDS)
  sortBy?: RequestSortField;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Request sort direction' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
