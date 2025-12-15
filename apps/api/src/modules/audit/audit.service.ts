import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../infra/database/schemas/audit-log.schema';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface AuditLogData {
  actorId: string | { sub?: string; [key: string]: unknown };
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

  /**
   * Helper method to populate actorId field, handling both valid ObjectId and malformed object cases
   */
  private async populateActorId(log: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const UserModel = this.auditLogModel.db.model('User');
      let userId: string | null = null;

      // Handle malformed actorId (stored as JWT payload object instead of ObjectId)
      if (log.actorId && typeof log.actorId === 'object') {
        // Check if it's a JWT payload object with 'sub' field
        const actorIdObj = log.actorId as { sub?: string; [key: string]: unknown };
        if ('sub' in actorIdObj && actorIdObj.sub && Types.ObjectId.isValid(actorIdObj.sub)) {
          userId = actorIdObj.sub;
        } else {
          // Try to convert object to string and validate
          const actorIdStr = String(log.actorId);
          if (Types.ObjectId.isValid(actorIdStr)) {
            userId = actorIdStr;
          } else if (log.actorId instanceof Types.ObjectId) {
            // It's an ObjectId instance
            userId = log.actorId.toString();
          }
        }
      } else if (log.actorId && typeof log.actorId === 'string' && Types.ObjectId.isValid(log.actorId)) {
        userId = log.actorId;
      }

      if (userId) {
        const user = await UserModel.findById(userId).select('email role').lean().exec();
        return {
          ...log,
          actorId: user || null,
        };
      }

      return {
        ...log,
        actorId: null,
      };
    } catch {
      return {
        ...log,
        actorId: null,
      };
    }
  }

  async log(data: AuditLogData) {
    // Extract user ID from actorId - handle both string and object (JWT payload) cases
    let actorId: string;
    if (typeof data.actorId === 'string') {
      actorId = data.actorId;
    } else if (data.actorId && typeof data.actorId === 'object' && 'sub' in data.actorId) {
      actorId = data.actorId.sub as string;
    } else {
      throw new HttpException('Invalid actorId format', HttpStatus.BAD_REQUEST);
    }

    // Ensure actorId is a valid ObjectId
    if (!Types.ObjectId.isValid(actorId)) {
      throw new HttpException('Invalid actorId format: must be a valid ObjectId', HttpStatus.BAD_REQUEST);
    }

    const auditLog = new this.auditLogModel({
      ...data,
      actorId: new Types.ObjectId(actorId),
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
    try {
      const query: Record<string, unknown> = {};

      if (filters?.actorId) {
        // Convert string to ObjectId if valid
        if (Types.ObjectId.isValid(filters.actorId)) {
          query.actorId = new Types.ObjectId(filters.actorId);
        } else {
          throw new HttpException('Invalid actorId format', HttpStatus.BAD_REQUEST);
        }
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
      
      // Fetch data and handle malformed actorId entries
      const rawData = await this.auditLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      // Transform data to handle malformed actorId entries (where actorId might be an object)
      const transformedData = await Promise.all(
        rawData.map((log) => this.populateActorId(log))
      );

      const total = await this.auditLogModel.countDocuments(query).exec();

      return new PaginatedResponseDto(transformedData, total, page, limit);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch audit logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRecentLogs(limit: number = 10) {
    try {
      const rawData = await this.auditLogModel
        .find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean()
        .exec();

      // Transform data to handle malformed actorId entries
      const transformedData = await Promise.all(
        rawData.map((log) => this.populateActorId(log))
      );

      return transformedData;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch recent audit logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

