import { PaginationDto } from '../../../common/dto/pagination.dto';
import { SessionType } from '@grow-fitness/shared-types';
export declare class FindKidsQueryDto extends PaginationDto {
    parentId?: string;
    sessionType?: SessionType;
}
