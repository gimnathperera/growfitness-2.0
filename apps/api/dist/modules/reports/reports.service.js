"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const report_schema_1 = require("../../infra/database/schemas/report.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const invoice_schema_1 = require("../../infra/database/schemas/invoice.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const location_schema_1 = require("../../infra/database/schemas/location.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
let ReportsService = class ReportsService {
    reportModel;
    sessionModel;
    invoiceModel;
    kidModel;
    userModel;
    locationModel;
    auditService;
    constructor(reportModel, sessionModel, invoiceModel, kidModel, userModel, locationModel, auditService) {
        this.reportModel = reportModel;
        this.sessionModel = sessionModel;
        this.invoiceModel = invoiceModel;
        this.kidModel = kidModel;
        this.userModel = userModel;
        this.locationModel = locationModel;
        this.auditService = auditService;
    }
    async findAll(pagination, type) {
        const skip = (pagination.page - 1) * pagination.limit;
        const query = {};
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
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const report = await this.reportModel.findById(id).exec();
        if (!report) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.REPORT_NOT_FOUND,
                message: 'Report not found',
            });
        }
        return report;
    }
    async create(createReportDto, actorId) {
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
            metadata: createReportDto,
        });
        return report;
    }
    async generate(generateReportDto, actorId) {
        try {
            const startDate = generateReportDto.startDate
                ? new Date(generateReportDto.startDate)
                : undefined;
            const endDate = generateReportDto.endDate ? new Date(generateReportDto.endDate) : undefined;
            if (startDate && endDate && startDate > endDate) {
                throw new common_1.BadRequestException({
                    errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                    message: 'Start date must be before end date',
                });
            }
            let reportData = {};
            switch (generateReportDto.type) {
                case report_schema_1.ReportType.ATTENDANCE:
                    reportData = await this.generateAttendanceReport(startDate, endDate, generateReportDto.filters);
                    break;
                case report_schema_1.ReportType.FINANCIAL:
                    reportData = await this.generateFinancialReport(startDate, endDate, generateReportDto.filters);
                    break;
                case report_schema_1.ReportType.SESSION_SUMMARY:
                    reportData = await this.generateSessionSummaryReport(startDate, endDate, generateReportDto.filters);
                    break;
                case report_schema_1.ReportType.PERFORMANCE:
                    reportData = await this.generatePerformanceReport(startDate, endDate, generateReportDto.filters);
                    break;
                case report_schema_1.ReportType.CUSTOM:
                    reportData = await this.generateCustomReport(startDate, endDate, generateReportDto.filters);
                    break;
                default:
                    throw new common_1.BadRequestException({
                        errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                        message: `Invalid report type: ${generateReportDto.type}`,
                    });
            }
            const title = generateReportDto.filters?.title ||
                `${generateReportDto.type} Report${startDate && endDate ? ` - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}` : ''}`;
            const report = new this.reportModel({
                type: generateReportDto.type,
                title,
                startDate,
                endDate,
                filters: generateReportDto.filters,
                status: report_schema_1.ReportStatus.GENERATED,
                data: reportData,
                generatedAt: new Date(),
            });
            await report.save();
            await this.auditService.log({
                actorId,
                action: 'GENERATE_REPORT',
                entityType: 'Report',
                entityId: report._id.toString(),
                metadata: generateReportDto,
            });
            return report;
        }
        catch (error) {
            const report = new this.reportModel({
                type: generateReportDto.type,
                title: `${generateReportDto.type} Report (Failed)`,
                startDate: generateReportDto.startDate ? new Date(generateReportDto.startDate) : undefined,
                endDate: generateReportDto.endDate ? new Date(generateReportDto.endDate) : undefined,
                filters: generateReportDto.filters,
                status: report_schema_1.ReportStatus.FAILED,
                data: { error: error instanceof Error ? error.message : 'Unknown error' },
            });
            await report.save();
            throw error;
        }
    }
    async generateAttendanceReport(startDate, endDate, filters) {
        const query = {};
        if (startDate || endDate) {
            const dateTimeQuery = {};
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
            query.locationId = new mongoose_2.Types.ObjectId(filters.locationId);
        }
        if (filters?.coachId) {
            query.coachId = new mongoose_2.Types.ObjectId(filters.coachId);
        }
        const sessions = await this.sessionModel
            .find(query)
            .populate('coachId', 'email coachProfile')
            .populate('locationId')
            .populate('kids')
            .exec();
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.status === shared_types_1.SessionStatus.COMPLETED).length;
        const cancelledSessions = sessions.filter(s => s.status === shared_types_1.SessionStatus.CANCELLED).length;
        const noShowSessions = sessions.filter(s => s.status === shared_types_1.SessionStatus.SCHEDULED || s.status === shared_types_1.SessionStatus.CONFIRMED).length;
        const byType = {
            INDIVIDUAL: sessions.filter(s => s.type === shared_types_1.SessionType.INDIVIDUAL).length,
            GROUP: sessions.filter(s => s.type === shared_types_1.SessionType.GROUP).length,
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
    async generateFinancialReport(startDate, endDate, filters) {
        const query = {};
        if (startDate || endDate) {
            const createdAtQuery = {};
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
            query.parentId = new mongoose_2.Types.ObjectId(filters.parentId);
        }
        if (filters?.coachId) {
            query.coachId = new mongoose_2.Types.ObjectId(filters.coachId);
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
            .filter(i => i.status === shared_types_1.InvoiceStatus.PAID)
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
        const pendingAmount = invoices
            .filter(i => i.status === shared_types_1.InvoiceStatus.PENDING)
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
        const overdueAmount = invoices
            .filter(i => i.status === shared_types_1.InvoiceStatus.OVERDUE)
            .reduce((sum, inv) => sum + inv.totalAmount, 0);
        const byType = {
            PARENT_INVOICE: invoices
                .filter(i => i.type === shared_types_1.InvoiceType.PARENT_INVOICE)
                .reduce((sum, inv) => sum + (inv.status === shared_types_1.InvoiceStatus.PAID ? inv.totalAmount : 0), 0),
            COACH_PAYOUT: invoices
                .filter(i => i.type === shared_types_1.InvoiceType.COACH_PAYOUT)
                .reduce((sum, inv) => sum + (inv.status === shared_types_1.InvoiceStatus.PAID ? inv.totalAmount : 0), 0),
        };
        const paymentTrends = await this.invoiceModel.aggregate([
            { $match: { ...query, status: shared_types_1.InvoiceStatus.PAID } },
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
    async generateSessionSummaryReport(startDate, endDate, filters) {
        const query = {};
        if (startDate || endDate) {
            const dateTimeQuery = {};
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
            query.locationId = new mongoose_2.Types.ObjectId(filters.locationId);
        }
        if (filters?.coachId) {
            query.coachId = new mongoose_2.Types.ObjectId(filters.coachId);
        }
        const sessions = await this.sessionModel
            .find(query)
            .populate('coachId', 'email coachProfile')
            .populate('locationId')
            .exec();
        const byStatus = {
            SCHEDULED: sessions.filter(s => s.status === shared_types_1.SessionStatus.SCHEDULED).length,
            CONFIRMED: sessions.filter(s => s.status === shared_types_1.SessionStatus.CONFIRMED).length,
            COMPLETED: sessions.filter(s => s.status === shared_types_1.SessionStatus.COMPLETED).length,
            CANCELLED: sessions.filter(s => s.status === shared_types_1.SessionStatus.CANCELLED).length,
        };
        const byType = {
            INDIVIDUAL: sessions.filter(s => s.type === shared_types_1.SessionType.INDIVIDUAL).length,
            GROUP: sessions.filter(s => s.type === shared_types_1.SessionType.GROUP).length,
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
    async generatePerformanceReport(startDate, endDate, filters) {
        const query = { isApproved: true };
        if (filters?.sessionType) {
            query.sessionType = filters.sessionType;
        }
        const kids = await this.kidModel.find(query).populate('parentId', 'email parentProfile').exec();
        const totalKids = kids.length;
        const kidsWithMilestones = kids.filter(k => k.milestones && k.milestones.length > 0).length;
        const kidsWithAchievements = kids.filter(k => k.achievements && k.achievements.length > 0).length;
        const bySessionType = {
            INDIVIDUAL: kids.filter(k => k.sessionType === shared_types_1.SessionType.INDIVIDUAL).length,
            GROUP: kids.filter(k => k.sessionType === shared_types_1.SessionType.GROUP).length,
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
    async generateCustomReport(startDate, endDate, filters) {
        const results = {};
        if (filters?.includeSessions) {
            const sessionQuery = {};
            if (startDate || endDate) {
                const dateTimeQuery = {};
                if (startDate)
                    dateTimeQuery.$gte = startDate;
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
            const invoiceQuery = {};
            if (startDate || endDate) {
                const createdAtQuery = {};
                if (startDate)
                    createdAtQuery.$gte = startDate;
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
            const userQuery = {};
            if (filters.userRole) {
                userQuery.role = filters.userRole;
            }
            const userCount = await this.userModel.countDocuments(userQuery).exec();
            results.users = { count: userCount };
        }
        if (filters?.includeKids) {
            const kidQuery = { isApproved: true };
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
    async delete(id, actorId) {
        const report = await this.reportModel.findById(id).exec();
        if (!report) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.REPORT_NOT_FOUND,
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
    async exportCSV(id) {
        const report = await this.reportModel.findById(id).exec();
        if (!report) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.REPORT_NOT_FOUND,
                message: 'Report not found',
            });
        }
        if (report.status !== report_schema_1.ReportStatus.GENERATED || !report.data) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_INPUT,
                message: 'Report must be generated before export',
            });
        }
        const headers = [];
        const rows = [];
        const flattenData = (obj, prefix = '') => {
            const flattened = {};
            for (const key in obj) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    Object.assign(flattened, flattenData(obj[key], newKey));
                }
                else if (Array.isArray(obj[key])) {
                    const arr = obj[key];
                    arr.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            Object.assign(flattened, flattenData(item, `${newKey}[${index}]`));
                        }
                        else {
                            flattened[`${newKey}[${index}]`] = item;
                        }
                    });
                }
                else {
                    flattened[newKey] = obj[key];
                }
            }
            return flattened;
        };
        const flattened = flattenData(report.data);
        headers.push(...Object.keys(flattened));
        rows.push(Object.values(flattened).map(v => String(v ?? '')));
        const metadataRow = [];
        headers.forEach((h, i) => {
            if (h === 'type')
                metadataRow[i] = report.type;
            else if (h === 'title')
                metadataRow[i] = report.title;
            else if (h === 'generatedAt')
                metadataRow[i] = report.generatedAt?.toISOString() || '';
            else
                metadataRow[i] = '';
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(report_schema_1.Report.name)),
    __param(1, (0, mongoose_1.InjectModel)(session_schema_1.Session.name)),
    __param(2, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(3, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(5, (0, mongoose_1.InjectModel)(location_schema_1.Location.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map