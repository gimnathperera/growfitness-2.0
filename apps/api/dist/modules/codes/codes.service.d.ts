import { Model } from 'mongoose';
import { Code, CodeDocument } from '../../infra/database/schemas/code.schema';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export interface CreateCodeDto {
    code: string;
    type: string;
    discountPercentage?: number;
    discountAmount?: number;
    expiryDate?: Date;
    usageLimit: number;
    description?: string;
}
export interface UpdateCodeDto {
    status?: string;
    expiryDate?: Date;
    usageLimit?: number;
    description?: string;
}
export declare class CodesService {
    private codeModel;
    private auditService;
    constructor(codeModel: Model<CodeDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, CodeDocument, {}, {}> & Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, CodeDocument, {}, {}> & Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createCodeDto: CreateCodeDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, CodeDocument, {}, {}> & Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateCodeDto: UpdateCodeDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, CodeDocument, {}, {}> & Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
