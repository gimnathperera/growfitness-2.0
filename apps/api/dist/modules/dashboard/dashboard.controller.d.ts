import { DashboardService } from './dashboard.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
