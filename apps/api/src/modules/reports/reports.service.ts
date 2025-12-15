import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../infra/database/schemas/report.schema';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

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
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, type?: string) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query: any = {};
    if (type) {
      query.type = type;
    }

    const [data, total] = await Promise.all([
      this.reportModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
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
    // This is a placeholder - actual report generation logic would go here
    // For now, we'll create a report with mock data
    const report = new this.reportModel({
      ...generateReportDto,
      title: `${generateReportDto.type} Report`,
      status: 'GENERATED',
      data: {
        summary: 'Report data would be generated here',
        details: [],
      },
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
}

