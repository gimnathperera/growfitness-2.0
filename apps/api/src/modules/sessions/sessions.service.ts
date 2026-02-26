import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { SessionType, SessionStatus, NotificationType } from '@grow-fitness/shared-types';
import { CreateSessionDto, UpdateSessionDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService
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

  private async getParentIdsFromKidIds(kidIds: Types.ObjectId[]): Promise<string[]> {
    if (!kidIds?.length) return [];
    const kids = await this.kidModel
      .find({ _id: { $in: kidIds } })
      .select('parentId')
      .lean()
      .exec();
    const parentIds = new Set<string>();
    for (const k of kids) {
      const pid = (k as any).parentId?.toString?.() ?? (k as any).parentId;
      if (pid) parentIds.add(pid);
    }
    return Array.from(parentIds);
  }

  async findAll(
    pagination: PaginationDto,
    filters?: {
      coachId?: string;
      locationId?: string;
      kidId?: string;
      status?: SessionStatus;
      startDate?: Date;
      endDate?: Date;
      isFreeSession?: boolean;
    }
  ) {
    const query: Record<string, unknown> = {};

    if (filters?.isFreeSession !== undefined) {
      query.isFreeSession = filters.isFreeSession;
    }

    if (filters?.coachId) {
      query.coachId = this.toObjectId(filters.coachId, 'coachId');
    }

    if (filters?.locationId) {
      query.locationId = this.toObjectId(filters.locationId, 'locationId');
    }

    if (filters?.kidId?.trim()) {
      query.kids = this.toObjectId(filters.kidId.trim(), 'kidId');
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
        .lean()
        .exec(),
      this.sessionModel.countDocuments(query).exec(),
    ]);

    const transformedData = (data as any[]).map(s => this.toSessionResponse(s));
    return new PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const session = await this.sessionModel
      .findById(id)
      .populate('coachId', 'email coachProfile')
      .populate('locationId')
      .populate('kids')
      .lean()
      .exec();

    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.SESSION_NOT_FOUND,
        message: 'Session not found',
      });
    }

    return this.toSessionResponse(session as any);
  }

  /**
   * Normalize session document: keep coachId/locationId as string IDs and expose
   * populated refs as coach and location.
   */
  private toSessionResponse(s: any) {
    const coachIdVal = s.coachId?._id ?? s.coachId;
    const locationIdVal = s.locationId?._id ?? s.locationId;
    const coach =
      s.coachId && typeof s.coachId === 'object'
        ? {
            id: s.coachId._id?.toString(),
            email: s.coachId.email,
            coachProfile: s.coachId.coachProfile,
          }
        : undefined;
    const location =
      s.locationId && typeof s.locationId === 'object'
        ? {
            id: s.locationId._id?.toString(),
            name: s.locationId.name,
            address: s.locationId.address,
            geo: s.locationId.geo,
            isActive: s.locationId.isActive,
            placeUrl: s.locationId.placeUrl,
          }
        : undefined;
    const kids = Array.isArray(s.kids)
      ? s.kids.map((k: any) =>
          k && typeof k === 'object' && k._id ? k._id.toString() : (k?.toString?.() ?? k)
        )
      : undefined;
    return {
      id: s._id?.toString(),
      title: s.title,
      type: s.type,
      coachId: coachIdVal != null ? coachIdVal.toString() : undefined,
      locationId: locationIdVal != null ? locationIdVal.toString() : undefined,
      coach,
      location,
      dateTime: s.dateTime,
      duration: s.duration,
      capacity: s.capacity,
      kids,
      status: s.status,
      isFreeSession: s.isFreeSession,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
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

    if (createSessionDto.type === SessionType.GROUP && createSessionDto.kids.length > capacity) {
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

    await this.auditService.log({
      actorId,
      action: 'CREATE_SESSION',
      entityType: 'Session',
      entityId: session._id.toString(),
      metadata: createSessionDto,
    });

    const sessionIdStr = session._id.toString();
    const parentIds = await this.getParentIdsFromKidIds(session.kids ?? []);
    const coachIdStr = session.coachId.toString();
    const title = 'New session scheduled';
    const body = `Session "${session.title}" has been scheduled.`;

    await this.notificationService.createNotification({
      userId: coachIdStr,
      type: NotificationType.SESSION_CREATED,
      title,
      body,
      entityType: 'Session',
      entityId: sessionIdStr,
    });
    for (const parentId of parentIds) {
      await this.notificationService.createNotification({
        userId: parentId,
        type: NotificationType.SESSION_CREATED,
        title,
        body,
        entityType: 'Session',
        entityId: sessionIdStr,
      });
    }

    return this.findById(sessionIdStr);
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
      ...(updateSessionDto.title && { title: updateSessionDto.title }),
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
      ...(updateSessionDto.isFreeSession !== undefined && {
        isFreeSession: updateSessionDto.isFreeSession,
      }),
    };

    const previousStatus = session.status;
    const previousDateTime = session.dateTime;

    Object.assign(session, {
      ...updatedFields,
    });

    await session.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_SESSION',
      entityType: 'Session',
      entityId: id,
      metadata: updateSessionDto,
    });

    const statusChanged =
      updateSessionDto.status !== undefined && updateSessionDto.status !== previousStatus;
    const dateTimeChanged =
      updateSessionDto.dateTime !== undefined &&
      new Date(updateSessionDto.dateTime).getTime() !== previousDateTime.getTime();

    if (statusChanged || dateTimeChanged) {
      const notifType =
        session.status === SessionStatus.CANCELLED
          ? NotificationType.SESSION_CANCELLED
          : session.status === SessionStatus.COMPLETED
            ? NotificationType.SESSION_COMPLETED
            : NotificationType.SESSION_UPDATED;
      const changes: string[] = [];
      if (statusChanged) changes.push(`status: ${previousStatus} → ${session.status}`);
      if (dateTimeChanged) changes.push(`date/time updated`);
      const changesStr = changes.length ? changes.join('; ') : 'Session updated';

      const sessionPopulated = await this.sessionModel
        .findById(id)
        .populate('coachId', 'email phone')
        .populate('kids')
        .exec();
      if (sessionPopulated) {
        const coachIdStr =
          (sessionPopulated.coachId as any)?._id?.toString?.() ??
          sessionPopulated.coachId?.toString?.();
        const parentIds = await this.getParentIdsFromKidIds(sessionPopulated.kids ?? []);
        const recipientIds = [coachIdStr, ...parentIds].filter(Boolean);

        for (const userId of recipientIds) {
          await this.notificationService.createNotification({
            userId,
            type: notifType,
            title: 'Session updated',
            body: `Session "${session.title}": ${changesStr}`,
            entityType: 'Session',
            entityId: id,
          });
        }

        const coachUser = coachIdStr
          ? await this.userModel.findById(coachIdStr).select('email phone').lean().exec()
          : null;
        if (coachUser && (coachUser as any).email) {
          await this.notificationService.sendSessionChange({
            email: (coachUser as any).email,
            phone: (coachUser as any).phone ?? '',
            sessionId: id,
            changes: changesStr,
          });
        }
        for (const parentId of parentIds) {
          const parent = await this.userModel
            .findById(parentId)
            .select('email phone')
            .lean()
            .exec();
          if (parent && (parent as any).email) {
            await this.notificationService.sendSessionChange({
              email: (parent as any).email,
              phone: (parent as any).phone ?? '',
              sessionId: id,
              changes: changesStr,
            });
          }
        }
      }
    }

    return this.findById(id);
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

    const coachIdStr = session.coachId.toString();
    const parentIds = await this.getParentIdsFromKidIds(session.kids ?? []);
    const title = 'Session deleted';
    const body = `Session "${session.title}" has been deleted.`;

    await this.notificationService.createNotification({
      userId: coachIdStr,
      type: NotificationType.SESSION_DELETED,
      title,
      body,
      entityType: 'Session',
      entityId: id,
    });
    for (const parentId of parentIds) {
      await this.notificationService.createNotification({
        userId: parentId,
        type: NotificationType.SESSION_DELETED,
        title,
        body,
        entityType: 'Session',
        entityId: id,
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
