import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from '../../infra/database/schemas/report.schema';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { SessionDocument } from '../../infra/database/schemas/session.schema';
import { InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { LocationDocument } from '../../infra/database/schemas/location.schema';
export interface CreateReportDto {
    type: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    filters?: Record<string, unknown>;
}
export interface GenerateReportDto {
    type: string;
    startDate?: Date;
    endDate?: Date;
    filters?: Record<string, unknown>;
}
export declare class ReportsService {
    private reportModel;
    private sessionModel;
    private invoiceModel;
    private kidModel;
    private userModel;
    private locationModel;
    private auditService;
    constructor(reportModel: Model<ReportDocument>, sessionModel: Model<SessionDocument>, invoiceModel: Model<InvoiceDocument>, kidModel: Model<KidDocument>, userModel: Model<UserDocument>, locationModel: Model<LocationDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto, type?: string): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, ReportDocument, {}, {}> & Report & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, {}> & Report & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createReportDto: CreateReportDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, {}> & Report & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    generate(generateReportDto: GenerateReportDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, ReportDocument, {}, {}> & Report & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private generateAttendanceReport;
    private generateFinancialReport;
    private generateSessionSummaryReport;
    private generatePerformanceReport;
    private generateCustomReport;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    exportCSV(id: string): Promise<string>;
}
