import { Model } from 'mongoose';
import { SessionsService } from '../sessions/sessions.service';
import { RequestsService } from '../requests/requests.service';
import { InvoicesService } from '../invoices/invoices.service';
import { AuditService } from '../audit/audit.service';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { KidDocument } from '../../infra/database/schemas/kid.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class DashboardService {
    private userModel;
    private kidModel;
    private readonly sessionsService;
    private readonly requestsService;
    private readonly invoicesService;
    private readonly auditService;
    constructor(userModel: Model<UserDocument>, kidModel: Model<KidDocument>, sessionsService: SessionsService, requestsService: RequestsService, invoicesService: InvoicesService, auditService: AuditService);
    getStats(): Promise<{
        todaysSessions: number;
        freeSessionRequests: number;
        freeSessionRequestsCount: number;
        rescheduleRequests: number;
        rescheduleRequestsCount: number;
        totalParents: number;
        totalCoaches: number;
        totalKids: number;
        todaysSessionsList: (import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").SessionDocument, {}, {}> & import("../../infra/database/schemas").Session & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    getWeeklySessions(): Promise<{
        total: number;
        byType: {
            INDIVIDUAL: number;
            GROUP: number;
        };
        byStatus: {
            SCHEDULED: number;
            CONFIRMED: number;
            CANCELLED: number;
            COMPLETED: number;
        };
    }>;
    getFinanceSummary(): Promise<{
        totalRevenue: any;
        pendingAmount: any;
        overdueAmount: any;
    }>;
    getActivityLogs(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<Record<string, unknown>>>;
}
