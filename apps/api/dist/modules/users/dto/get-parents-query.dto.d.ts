import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UserStatus } from '@grow-fitness/shared-types';
export declare class GetParentsQueryDto extends PaginationDto {
    search?: string;
    location?: string;
    status?: UserStatus;
}
