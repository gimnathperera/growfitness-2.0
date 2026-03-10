import { Response } from 'express';
import { ReportsService, CreateReportDto, GenerateReportDto } from './reports.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    findAll(pagination: PaginationDto, type?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ReportDocument, {}, {}> & import("../../infra/database/schemas").Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ReportDocument, {}, {}> & import("../../infra/database/schemas").Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createReportDto: CreateReportDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ReportDocument, {}, {}> & import("../../infra/database/schemas").Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    generate(generateReportDto: GenerateReportDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").ReportDocument, {}, {}> & import("../../infra/database/schemas").Report & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    exportCSV(id: string, res: Response): Promise<void>;
}
