import { Injectable } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { RequestsService } from '../requests/requests.service';
import { InvoicesService } from '../invoices/invoices.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly requestsService: RequestsService,
    private readonly invoicesService: InvoicesService,
    private readonly auditService: AuditService
  ) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaysSessions, freeSessionRequests, rescheduleRequests] = await Promise.all([
      this.sessionsService.findByDateRange(today, tomorrow),
      this.requestsService.countFreeSessionRequests(),
      this.requestsService.countRescheduleRequests(),
    ]);

    return {
      todaysSessions: todaysSessions.length,
      freeSessionRequestsCount: freeSessionRequests,
      rescheduleRequestsCount: rescheduleRequests,
      todaysSessionsList: todaysSessions,
    };
  }

  async getWeeklySessions() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return this.sessionsService.getWeeklySummary(startOfWeek, endOfWeek);
  }

  async getFinanceSummary() {
    return this.invoicesService.getFinanceSummary();
  }

  async getActivityLogs() {
    return this.auditService.getRecentLogs(10);
  }
}

