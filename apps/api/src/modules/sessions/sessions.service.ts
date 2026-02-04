import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  private toObjectId(id: string, fieldName: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_ID,
        message: `Invalid ${fieldName} format. Expected a valid MongoDB ObjectId.`,
      });
    }
    return new Types.ObjectId(id);
  }

  private toObjectIdArray(ids: string[] | undefined, fieldName: string) {
    if (!ids) return ids;
    return ids.map(id => this.toObjectId(id, fieldName));
  }

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
      query.coachId = this.toObjectId(filters.coachId, 'coachId');
    }

    if (filters?.locationId) {
      query.locationId = this.toObjectId(filters.locationId, 'locationId');
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
    if (!createSessionDto.kids?.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'At least one kid ID is required',
      });
    }

    if (createSessionDto.type === SessionType.INDIVIDUAL && createSessionDto.kids.length !== 1) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require exactly one kid ID',
      });
    }

    const capacity =
      createSessionDto.capacity ?? (createSessionDto.type === SessionType.GROUP ? 10 : 1);

    if (createSessionDto.type === SessionType.GROUP && createSessionDto.kids!.length > capacity) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_SESSION_CAPACITY,
        message: 'Number of kids exceeds session capacity',
      });
    }

    const coachObjectId = this.toObjectId(createSessionDto.coachId, 'coachId');
    const locationObjectId = this.toObjectId(createSessionDto.locationId, 'locationId');
    const kidObjectIds = this.toObjectIdArray(createSessionDto.kids, 'kids');

    const session = new this.sessionModel({
      ...createSessionDto,
      coachId: coachObjectId,
      locationId: locationObjectId,
      kids: kidObjectIds,
      dateTime: new Date(createSessionDto.dateTime),
      capacity,
    });

    await session.save();

    const createdSession = await this.sessionModel
      .findById(session._id)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .exec();

    await this.auditService.log({
      actorId,
      action: 'CREATE_SESSION',
      entityType: 'Session',
      entityId: session._id.toString(),
      metadata: createSessionDto,
    });

    return createdSession ?? session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto, actorId: string) {
    const session = await this.sessionModel.findById(id).exec();

    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    if (
      updateSessionDto.kids &&
      updateSessionDto.kids.length > 0 &&
      session.type === SessionType.INDIVIDUAL &&
      updateSessionDto.kids.length !== 1
    ) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require exactly one kid ID',
      });
    }

    if (
      updateSessionDto.kids &&
      session.type === SessionType.GROUP &&
      updateSessionDto.kids.length > (updateSessionDto.capacity ?? session.capacity)
    ) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_SESSION_CAPACITY,
        message: 'Number of kids exceeds session capacity',
      });
    }

    const updatedFields: Partial<Session> = {
      ...(updateSessionDto.coachId && {
        coachId: this.toObjectId(updateSessionDto.coachId, 'coachId'),
      }),
      ...(updateSessionDto.locationId && {
        locationId: this.toObjectId(updateSessionDto.locationId, 'locationId'),
      }),
      ...(updateSessionDto.dateTime && { dateTime: new Date(updateSessionDto.dateTime) }),
      ...(updateSessionDto.duration && { duration: updateSessionDto.duration }),
      ...(updateSessionDto.capacity && { capacity: updateSessionDto.capacity }),
      ...(updateSessionDto.kids && { kids: this.toObjectIdArray(updateSessionDto.kids, 'kids') }),
      ...(updateSessionDto.status && { status: updateSessionDto.status }),
      ...(updateSessionDto.isFreeSession !== undefined && { isFreeSession: updateSessionDto.isFreeSession }),
    };

    Object.assign(session, {
      ...updatedFields,
    });

    await session.save();

    const updatedSession = await this.sessionModel
      .findById(id)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .exec();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_SESSION',
      entityType: 'Session',
      entityId: id,
      metadata: updateSessionDto,
    });

    return updatedSession ?? session;
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
