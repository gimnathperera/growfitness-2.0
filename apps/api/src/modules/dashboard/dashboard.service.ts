import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionsService } from '../sessions/sessions.service';
import { RequestsService } from '../requests/requests.service';
import { InvoicesService } from '../invoices/invoices.service';
import { AuditService } from '../audit/audit.service';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserRole } from '@grow-fitness/shared-types';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
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

    const [
      todaysSessions,
      freeSessionRequests,
      rescheduleRequests,
      totalParents,
      totalCoaches,
      totalKids,
    ] = await Promise.all([
      this.sessionsService.findByDateRange(today, tomorrow),
      this.requestsService.countFreeSessionRequests(),
      this.requestsService.countRescheduleRequests(),
      this.userModel.countDocuments({ role: UserRole.PARENT }).exec(),
      this.userModel.countDocuments({ role: UserRole.COACH }).exec(),
      this.kidModel.countDocuments().exec(),
    ]);

    return {
      todaysSessions: todaysSessions.length,
      freeSessionRequests: freeSessionRequests,
      freeSessionRequestsCount: freeSessionRequests, // Keep for backward compatibility
      rescheduleRequests: rescheduleRequests,
      rescheduleRequestsCount: rescheduleRequests, // Keep for backward compatibility
      totalParents,
      totalCoaches,
      totalKids,
      totalStudents: totalKids, // Alias for total kids
      todaysSessionsList: todaysSessions,
    };
  }

  async getWeeklySessions() {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const summary = await this.sessionsService.getWeeklySummary(startOfWeek, endOfWeek);
    return summary.chartData;
  }

  async getFinanceSummary() {
    return this.invoicesService.getFinanceSummary();
  }

  async getActivityLogs(pagination: PaginationDto) {
    return this.auditService.findAll(pagination);
  }
}
