import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { SessionType } from '@grow-fitness/shared-types';

export class FindKidsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by parent ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ enum: SessionType, description: 'Filter by session type' })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiPropertyOptional({ description: 'Filter by exact gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Minimum age in years', minimum: 0, maximum: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(18)
  minAge?: number;

  @ApiPropertyOptional({ description: 'Maximum age in years', minimum: 0, maximum: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(18)
  maxAge?: number;

  // search is already defined in PaginationDto, no need to redeclare
}
