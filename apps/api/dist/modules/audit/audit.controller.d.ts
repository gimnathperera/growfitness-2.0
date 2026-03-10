import { AuditService } from './audit.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(pagination: PaginationDto, actorId?: string, entityType?: string, startDate?: string, endDate?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<Record<string, unknown>>>;
}
