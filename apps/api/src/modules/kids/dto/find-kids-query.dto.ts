import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { SessionType } from '@grow-fitness/shared-types';

export class FindKidsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  // search is already defined in PaginationDto, no need to redeclare
}
