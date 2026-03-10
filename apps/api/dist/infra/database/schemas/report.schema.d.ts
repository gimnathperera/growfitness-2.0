import { Document } from 'mongoose';
export type ReportDocument = Report & Document;
export declare enum ReportType {
    ATTENDANCE = "ATTENDANCE",
    PERFORMANCE = "PERFORMANCE",
    FINANCIAL = "FINANCIAL",
    SESSION_SUMMARY = "SESSION_SUMMARY",
    CUSTOM = "CUSTOM"
}
export declare enum ReportStatus {
    PENDING = "PENDING",
    GENERATED = "GENERATED",
    FAILED = "FAILED"
}
export declare class Report {
    type: ReportType;
    title: string;
    description?: string;
    status: ReportStatus;
    startDate?: Date;
    endDate?: Date;
    filters?: Record<string, unknown>;
    data?: Record<string, unknown>;
    fileUrl?: string;
    generatedAt?: Date;
}
export declare const ReportSchema: import("mongoose").Schema<Report, import("mongoose").Model<Report, any, any, any, Document<unknown, any, Report, any, {}> & Report & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Report, Document<unknown, {}, import("mongoose").FlatRecord<Report>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Report> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
