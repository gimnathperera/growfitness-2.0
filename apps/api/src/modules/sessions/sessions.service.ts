import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { SessionType, SessionStatus } from '@grow-fitness/shared-types';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private auditService: AuditService
  ) {}

  async findAll(
    pagination: PaginationDto,
    filters?: {
      coachId?: string;
      locationId?: string;
      status?: SessionStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const query: Record<string, unknown> = {};

    if (filters?.coachId) {
      query.coachId = filters.coachId;
    }

    if (filters?.locationId) {
      query.locationId = filters.locationId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      const dateTimeFilter: { $gte?: Date; $lte?: Date } = {};
      if (filters.startDate) {
        dateTimeFilter.$gte = filters.startDate;
      }
      if (filters.endDate) {
        dateTimeFilter.$lte = filters.endDate;
      }
      query.dateTime = dateTimeFilter;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.sessionModel
        .find(query)
        .populate('coachId', 'email coachProfile')
        .populate('locationId')
        .populate('kids')
        .populate('kidId')
        .sort({ dateTime: 1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.sessionModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const session = await this.sessionModel
      .findById(id)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .populate('kidId')
      .exec();

    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    return session;
  }

  async create(createSessionDto: CreateSessionDto, actorId: string) {
    if (createSessionDto.type === SessionType.GROUP && !createSessionDto.kids?.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Group sessions require at least one kid',
      });
    }

    if (createSessionDto.type === SessionType.INDIVIDUAL && !createSessionDto.kidId) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require a kid ID',
      });
    }

    if (
      createSessionDto.type === SessionType.GROUP &&
      createSessionDto.kids!.length > createSessionDto.capacity!
    ) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_SESSION_CAPACITY,
        message: 'Number of kids exceeds session capacity',
      });
    }

    const session = new this.sessionModel({
      ...createSessionDto,
      dateTime: new Date(createSessionDto.dateTime),
      capacity: createSessionDto.capacity || (createSessionDto.type === SessionType.GROUP ? 10 : 1),
    });

    await session.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_SESSION',
      entityType: 'Session',
      entityId: session._id.toString(),
      metadata: createSessionDto,
    });

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto, actorId: string) {
    const session = await this.sessionModel.findById(id).exec();

    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    Object.assign(session, {
      ...(updateSessionDto.coachId && { coachId: updateSessionDto.coachId }),
      ...(updateSessionDto.locationId && { locationId: updateSessionDto.locationId }),
      ...(updateSessionDto.dateTime && { dateTime: new Date(updateSessionDto.dateTime) }),
      ...(updateSessionDto.duration && { duration: updateSessionDto.duration }),
      ...(updateSessionDto.capacity && { capacity: updateSessionDto.capacity }),
      ...(updateSessionDto.kids && { kids: updateSessionDto.kids }),
      ...(updateSessionDto.kidId && { kidId: updateSessionDto.kidId }),
      ...(updateSessionDto.status && { status: updateSessionDto.status }),
    });

    await session.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_SESSION',
      entityType: 'Session',
      entityId: id,
      metadata: updateSessionDto,
    });

    return session;
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.sessionModel
      .find({
        dateTime: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .populate('kidId')
      .sort({ dateTime: 1 })
      .exec();
  }

  async getWeeklySummary(startDate: Date, endDate: Date) {
    const sessions = await this.findByDateRange(startDate, endDate);

    const summary = {
      total: sessions.length,
      byType: {
        INDIVIDUAL: sessions.filter(s => s.type === SessionType.INDIVIDUAL).length,
        GROUP: sessions.filter(s => s.type === SessionType.GROUP).length,
      },
      byStatus: {
        SCHEDULED: sessions.filter(s => s.status === SessionStatus.SCHEDULED).length,
        CONFIRMED: sessions.filter(s => s.status === SessionStatus.CONFIRMED).length,
        CANCELLED: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
        COMPLETED: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
      },
    };

    return summary;
  }

  async delete(id: string, actorId: string) {
    const session = await this.sessionModel.findById(id).exec();

    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    await this.sessionModel.findByIdAndDelete(id).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_SESSION',
      entityType: 'Session',
      entityId: id,
    });

    return { message: 'Session deleted successfully' };
  }
}
