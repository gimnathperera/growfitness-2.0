import { PaginationDto } from '../../../common/dto/pagination.dto';
import { SessionStatus } from '@grow-fitness/shared-types';
export declare class GetSessionsQueryDto extends PaginationDto {
    coachId?: string;
    locationId?: string;
    kidId?: string;
    status?: SessionStatus;
    startDate?: string;
    endDate?: string;
}
