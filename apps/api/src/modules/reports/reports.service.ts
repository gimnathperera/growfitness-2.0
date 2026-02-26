import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Report,
  ReportDocument,
  ReportType,
  ReportStatus,
} from '../../infra/database/schemas/report.schema';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { Invoice, InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { Location, LocationDocument } from '../../infra/database/schemas/location.schema';
import {
  SessionType,
  SessionStatus,
  InvoiceStatus,
  InvoiceType,
  UserRole,
} from '@grow-fitness/shared-types';

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

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, type?: string) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query: any = {};
    if (type) {
      query.type = type;
    }

    const [data, total] = await Promise.all([
      this.reportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.reportModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const report = await this.reportModel.findById(id).exec();

    if (!report) {
      throw new NotFoundException({
        errorCode: ErrorCode.REPORT_NOT_FOUND,
        message: 'Report not found',
      });
    }

    return report;
  }

  async create(createReportDto: CreateReportDto, actorId: string) {
    const report = new this.reportModel({
      ...createReportDto,
      status: 'PENDING',
    });
    await report.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_REPORT',
      entityType: 'Report',
      entityId: report._id.toString(),
      metadata: createReportDto as unknown as Record<string, unknown>,
    });

    return report;
  }

  async generate(generateReportDto: GenerateReportDto, actorId: string) {
    try {
      const startDate = generateReportDto.startDate
        ? new Date(generateReportDto.startDate)
        : undefined;
      const endDate = generateReportDto.endDate ? new Date(generateReportDto.endDate) : undefined;

      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException({
          errorCode: ErrorCode.INVALID_INPUT,
          message: 'Start date must be before end date',
        });
      }

      let reportData: Record<string, unknown> = {};

      switch (generateReportDto.type as ReportType) {
        case ReportType.ATTENDANCE:
          reportData = await this.generateAttendanceReport(
            startDate,
            endDate,
            generateReportDto.filters
          );
          break;
        case ReportType.FINANCIAL:
          reportData = await this.generateFinancialReport(
            startDate,
            endDate,
            generateReportDto.filters
          );
          break;
        case ReportType.SESSION_SUMMARY:
          reportData = await this.generateSessionSummaryReport(
            startDate,
            endDate,
            generateReportDto.filters
          );
          break;
        case ReportType.PERFORMANCE:
          reportData = await this.generatePerformanceReport(
            startDate,
            endDate,
            generateReportDto.filters
          );
          break;
        case ReportType.CUSTOM:
          reportData = await this.generateCustomReport(
            startDate,
            endDate,
            generateReportDto.filters
          );
          break;
        default:
          throw new BadRequestException({
            errorCode: ErrorCode.INVALID_INPUT,
            message: `Invalid report type: ${generateReportDto.type}`,
          });
      }

      const title =
        (generateReportDto.filters?.title as string) ||
        `${generateReportDto.type} Report${startDate && endDate ? ` - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}` : ''}`;

      const report = new this.reportModel({
        type: generateReportDto.type as ReportType,
        title,
        startDate,
        endDate,
        filters: generateReportDto.filters,
        status: ReportStatus.GENERATED,
        data: reportData,
        generatedAt: new Date(),
      });

      await report.save();

      await this.auditService.log({
        actorId,
        action: 'GENERATE_REPORT',
        entityType: 'Report',
        entityId: report._id.toString(),
        metadata: generateReportDto as unknown as Record<string, unknown>,
      });

      return report;
    } catch (error) {
      // Create a failed report record
      const report = new this.reportModel({
        type: generateReportDto.type as ReportType,
        title: `${generateReportDto.type} Report (Failed)`,
        startDate: generateReportDto.startDate ? new Date(generateReportDto.startDate) : undefined,
        endDate: generateReportDto.endDate ? new Date(generateReportDto.endDate) : undefined,
        filters: generateReportDto.filters,
        status: ReportStatus.FAILED,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      await report.save();

      throw error;
    }
  }

  private async generateAttendanceReport(
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      const dateTimeQuery: Record<string, Date> = {};
      if (startDate) {
        dateTimeQuery.$gte = startDate;
      }
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        dateTimeQuery.$lte = endDateWithTime;
      }
      query.dateTime = dateTimeQuery;
    }

    if (filters?.locationId) {
      query.locationId = new Types.ObjectId(filters.locationId as string);
    }

    if (filters?.coachId) {
      query.coachId = new Types.ObjectId(filters.coachId as string);
    }

    const sessions = await this.sessionModel
      .find(query)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .exec();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED).length;
    const cancelledSessions = sessions.filter(s => s.status === SessionStatus.CANCELLED).length;
    const noShowSessions = sessions.filter(
      s => s.status === SessionStatus.SCHEDULED || s.status === SessionStatus.CONFIRMED
    ).length;

    const byType = {
      INDIVIDUAL: sessions.filter(s => s.type === SessionType.INDIVIDUAL).length,
      GROUP: sessions.filter(s => s.type === SessionType.GROUP).length,
    };

    const byLocation = await this.sessionModel.aggregate([
      { $match: query },
      { $group: { _id: '$locationId', count: { $sum: 1 } } },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      { $project: { locationName: '$location.name', count: 1 } },
    ]);

    const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      summary: {
        totalSessions,
        completedSessions,
        cancelledSessions,
        noShowSessions,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      byType,
      byLocation: byLocation.map(item => ({
        location: item.locationName || 'Unknown',
        count: item.count,
      })),
      dateRange: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }

  private async generateFinancialReport(
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      const createdAtQuery: Record<string, Date> = {};
      if (startDate) {
        createdAtQuery.$gte = startDate;
      }
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        createdAtQuery.$lte = endDateWithTime;
      }
      query.createdAt = createdAtQuery;
    }

    if (filters?.parentId) {
      query.parentId = new Types.ObjectId(filters.parentId as string);
    }

    if (filters?.coachId) {
      query.coachId = new Types.ObjectId(filters.coachId as string);
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    const invoices = await this.invoiceModel
      .find(query)
      .populate('parentId', 'email parentProfile')
      .populate('coachId', 'email coachProfile')
      .exec();

    const totalRevenue = invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingAmount = invoices
      .filter(i => i.status === InvoiceStatus.PENDING)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const overdueAmount = invoices
      .filter(i => i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const byType = {
      PARENT_INVOICE: invoices
        .filter(i => i.type === InvoiceType.PARENT_INVOICE)
        .reduce((sum, inv) => sum + (inv.status === InvoiceStatus.PAID ? inv.totalAmount : 0), 0),
      COACH_PAYOUT: invoices
        .filter(i => i.type === InvoiceType.COACH_PAYOUT)
        .reduce((sum, inv) => sum + (inv.status === InvoiceStatus.PAID ? inv.totalAmount : 0), 0),
    };

    const paymentTrends = await this.invoiceModel.aggregate([
      { $match: { ...query, status: InvoiceStatus.PAID } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paidAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      summary: {
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalInvoices: invoices.length,
      },
      byType,
      paymentTrends: paymentTrends.map(item => ({
        month: item._id,
        total: item.total,
        count: item.count,
      })),
      dateRange: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }

  private async generateSessionSummaryReport(
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      const dateTimeQuery: Record<string, Date> = {};
      if (startDate) {
        dateTimeQuery.$gte = startDate;
      }
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        dateTimeQuery.$lte = endDateWithTime;
      }
      query.dateTime = dateTimeQuery;
    }

    if (filters?.locationId) {
      query.locationId = new Types.ObjectId(filters.locationId as string);
    }

    if (filters?.coachId) {
      query.coachId = new Types.ObjectId(filters.coachId as string);
    }

    const sessions = await this.sessionModel
      .find(query)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .exec();

    const byStatus = {
      SCHEDULED: sessions.filter(s => s.status === SessionStatus.SCHEDULED).length,
      CONFIRMED: sessions.filter(s => s.status === SessionStatus.CONFIRMED).length,
      COMPLETED: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
      CANCELLED: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
    };

    const byType = {
      INDIVIDUAL: sessions.filter(s => s.type === SessionType.INDIVIDUAL).length,
      GROUP: sessions.filter(s => s.type === SessionType.GROUP).length,
    };

    const freeSessions = sessions.filter(s => s.isFreeSession).length;

    const byCoach = await this.sessionModel.aggregate([
      { $match: query },
      { $group: { _id: '$coachId', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'coach' } },
      { $unwind: { path: '$coach', preserveNullAndEmptyArrays: true } },
      { $project: { coachName: '$coach.coachProfile.name', coachEmail: '$coach.email', count: 1 } },
    ]);

    const byLocation = await this.sessionModel.aggregate([
      { $match: query },
      { $group: { _id: '$locationId', count: { $sum: 1 } } },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
      { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
      { $project: { locationName: '$location.name', count: 1 } },
    ]);

    return {
      summary: {
        totalSessions: sessions.length,
        freeSessions,
      },
      byStatus,
      byType,
      byCoach: byCoach.map(item => ({
        coach: item.coachName || item.coachEmail || 'Unknown',
        count: item.count,
      })),
      byLocation: byLocation.map(item => ({
        location: item.locationName || 'Unknown',
        count: item.count,
      })),
      dateRange: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }

  private async generatePerformanceReport(
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const query: Record<string, unknown> = { isApproved: true };

    if (filters?.sessionType) {
      query.sessionType = filters.sessionType;
    }

    const kids = await this.kidModel.find(query).populate('parentId', 'email parentProfile').exec();

    const totalKids = kids.length;
    const kidsWithMilestones = kids.filter(k => k.milestones && k.milestones.length > 0).length;
    const kidsWithAchievements = kids.filter(
      k => k.achievements && k.achievements.length > 0
    ).length;

    const bySessionType = {
      INDIVIDUAL: kids.filter(k => k.sessionType === SessionType.INDIVIDUAL).length,
      GROUP: kids.filter(k => k.sessionType === SessionType.GROUP).length,
    };

    const milestoneStats = await this.kidModel.aggregate([
      { $match: query },
      { $project: { milestoneCount: { $size: { $ifNull: ['$milestones', []] } } } },
      {
        $group: {
          _id: null,
          totalMilestones: { $sum: '$milestoneCount' },
          kidsWithMilestones: { $sum: { $cond: [{ $gt: ['$milestoneCount', 0] }, 1, 0] } },
        },
      },
    ]);

    const achievementStats = await this.kidModel.aggregate([
      { $match: query },
      { $project: { achievementCount: { $size: { $ifNull: ['$achievements', []] } } } },
      {
        $group: {
          _id: null,
          totalAchievements: { $sum: '$achievementCount' },
          kidsWithAchievements: { $sum: { $cond: [{ $gt: ['$achievementCount', 0] }, 1, 0] } },
        },
      },
    ]);

    return {
      summary: {
        totalKids,
        kidsWithMilestones,
        kidsWithAchievements,
        averageMilestonesPerKid: milestoneStats[0]
          ? Math.round((milestoneStats[0].totalMilestones / totalKids) * 100) / 100
          : 0,
        averageAchievementsPerKid: achievementStats[0]
          ? Math.round((achievementStats[0].totalAchievements / totalKids) * 100) / 100
          : 0,
      },
      bySessionType,
      milestoneStats: milestoneStats[0] || { totalMilestones: 0, kidsWithMilestones: 0 },
      achievementStats: achievementStats[0] || { totalAchievements: 0, kidsWithAchievements: 0 },
    };
  }

  private async generateCustomReport(
    startDate?: Date,
    endDate?: Date,
    filters?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Custom report combines multiple data sources based on filters
    const results: Record<string, unknown> = {};

    if (filters?.includeSessions) {
      const sessionQuery: Record<string, unknown> = {};
      if (startDate || endDate) {
        const dateTimeQuery: Record<string, Date> = {};
        if (startDate) dateTimeQuery.$gte = startDate;
        if (endDate) {
          const endDateWithTime = new Date(endDate);
          endDateWithTime.setHours(23, 59, 59, 999);
          dateTimeQuery.$lte = endDateWithTime;
        }
        sessionQuery.dateTime = dateTimeQuery;
      }
      const sessionCount = await this.sessionModel.countDocuments(sessionQuery).exec();
      results.sessions = { count: sessionCount };
    }

    if (filters?.includeInvoices) {
      const invoiceQuery: Record<string, unknown> = {};
      if (startDate || endDate) {
        const createdAtQuery: Record<string, Date> = {};
        if (startDate) createdAtQuery.$gte = startDate;
        if (endDate) {
          const endDateWithTime = new Date(endDate);
          endDateWithTime.setHours(23, 59, 59, 999);
          createdAtQuery.$lte = endDateWithTime;
        }
        invoiceQuery.createdAt = createdAtQuery;
      }
      const invoiceCount = await this.invoiceModel.countDocuments(invoiceQuery).exec();
      results.invoices = { count: invoiceCount };
    }

    if (filters?.includeUsers) {
      const userQuery: Record<string, unknown> = {};
      if (filters.userRole) {
        userQuery.role = filters.userRole;
      }
      const userCount = await this.userModel.countDocuments(userQuery).exec();
      results.users = { count: userCount };
    }

    if (filters?.includeKids) {
      const kidQuery: Record<string, unknown> = { isApproved: true };
      if (filters.kidSessionType) {
        kidQuery.sessionType = filters.kidSessionType;
      }
      const kidCount = await this.kidModel.countDocuments(kidQuery).exec();
      results.kids = { count: kidCount };
    }

    return {
      ...results,
      dateRange: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      filters,
    };
  }

  async delete(id: string, actorId: string) {
    const report = await this.reportModel.findById(id).exec();

    if (!report) {
      throw new NotFoundException({
        errorCode: ErrorCode.REPORT_NOT_FOUND,
        message: 'Report not found',
      });
    }

    await this.reportModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_REPORT',
      entityType: 'Report',
      entityId: id,
    });

    return { message: 'Report deleted successfully' };
  }

  async exportCSV(id: string): Promise<string> {
    const report = await this.reportModel.findById(id).exec();

    if (!report) {
      throw new NotFoundException({
        errorCode: ErrorCode.REPORT_NOT_FOUND,
        message: 'Report not found',
      });
    }

    if (report.status !== ReportStatus.GENERATED || !report.data) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Report must be generated before export',
      });
    }

    const headers: string[] = [];
    const rows: string[][] = [];

    // Flatten report data for CSV
    const flattenData = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
      const flattened: Record<string, unknown> = {};
      for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenData(obj[key] as Record<string, unknown>, newKey));
        } else if (Array.isArray(obj[key])) {
          const arr = obj[key] as unknown[];
          arr.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              Object.assign(
                flattened,
                flattenData(item as Record<string, unknown>, `${newKey}[${index}]`)
              );
            } else {
              flattened[`${newKey}[${index}]`] = item;
            }
          });
        } else {
          flattened[newKey] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flattenData(report.data);
    headers.push(...Object.keys(flattened));
    rows.push(Object.values(flattened).map(v => String(v ?? '')));

    // Add metadata
    const metadataRow: string[] = [];
    headers.forEach((h, i) => {
      if (h === 'type') metadataRow[i] = report.type;
      else if (h === 'title') metadataRow[i] = report.title;
      else if (h === 'generatedAt') metadataRow[i] = report.generatedAt?.toISOString() || '';
      else metadataRow[i] = '';
    });

    const csv = [
      ['Report Type', report.type],
      ['Report Title', report.title],
      ['Generated At', report.generatedAt?.toISOString() || ''],
      [
        'Date Range',
        `${report.startDate?.toISOString() || 'N/A'} to ${report.endDate?.toISOString() || 'N/A'}`,
      ],
      [],
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  }
}
