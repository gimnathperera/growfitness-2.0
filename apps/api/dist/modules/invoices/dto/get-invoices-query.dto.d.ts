import { PaginationDto } from '../../../common/dto/pagination.dto';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
export declare class GetInvoicesQueryDto extends PaginationDto {
    type?: InvoiceType;
    parentId?: string;
    coachId?: string;
    status?: InvoiceStatus;
}
