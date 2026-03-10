import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../infra/database/schemas/audit-log.schema';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export interface AuditLogData {
    actorId: string | {
        sub?: string;
        [key: string]: unknown;
    };
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
}
export declare class AuditService {
    private auditLogModel;
    constructor(auditLogModel: Model<AuditLogDocument>);
    private populateActorId;
    log(data: AuditLogData): Promise<import("mongoose").Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(pagination: PaginationDto, filters?: {
        actorId?: string;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<PaginatedResponseDto<Record<string, unknown>>>;
    getRecentLogs(limit?: number): Promise<Record<string, unknown>[]>;
}
