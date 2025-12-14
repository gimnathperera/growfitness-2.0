import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../infra/database/schemas/audit-log.schema';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface AuditLogData {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>
  ) {}

  async log(data: AuditLogData) {
    const auditLog = new this.auditLogModel({
      ...data,
      timestamp: new Date(),
    });

    await auditLog.save();
    return auditLog;
  }

  async findAll(
    pagination: PaginationDto,
    filters?: {
      actorId?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const query: Record<string, unknown> = {};

    if (filters?.actorId) {
      query.actorId = filters.actorId;
    }

    if (filters?.entityType) {
      query.entityType = filters.entityType;
    }

    if (filters?.startDate || filters?.endDate) {
      const timestampQuery: Record<string, Date> = {};
      if (filters.startDate) {
        timestampQuery.$gte = filters.startDate;
      }
      if (filters.endDate) {
        timestampQuery.$lte = filters.endDate;
      }
      query.timestamp = timestampQuery;
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('actorId', 'email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async getRecentLogs(limit: number = 10) {
    return this.auditLogModel
      .find()
      .populate('actorId', 'email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}

