import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import {
  SessionType,
  SessionStatus,
  NotificationType,
  RecurrenceFrequency,
} from '@grow-fitness/shared-types';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CreateRecurringSessionDto,
} from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { GoogleCalendarSyncService } from '../google-calendar/google-calendar-sync.service';

@Injectable()
export class SessionsService {
  private logger = new Logger(SessionsService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService,
    private googleCalendarSync: GoogleCalendarSyncService
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

  private getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private parseStartDateAndTime(startDate: string | Date, time: string): Date {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);
    const baseDate = new Date(startDate);

    if (Number.isNaN(baseDate.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Invalid start date or time format',
      });
    }

    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }

  private getWeekDifference(startDate: Date, date: Date): number {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const start = this.getStartOfDay(startDate);
    const current = this.getStartOfDay(date);
    return Math.floor((current.getTime() - start.getTime()) / msPerWeek);
  }

  private generateRecurringDates(dto: CreateRecurringSessionDto): Date[] {
    const maxSessions = 52;
    const start = this.parseStartDateAndTime(dto.startDate, dto.time);
    const endDate = dto.recurrence.endDate ? new Date(dto.recurrence.endDate) : null;
    const endBoundary = endDate
      ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
      : null;
    const occurrencesLimit = Math.min(dto.recurrence.occurrences ?? maxSessions, maxSessions);
    const dates: Date[] = [];

    if (dto.recurrence.frequency === RecurrenceFrequency.DAILY) {
      let cursor = new Date(start);
      while (dates.length < occurrencesLimit) {
        if (endBoundary && cursor > endBoundary) break;
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + dto.recurrence.interval);
      }
      return dates;
    }

    if (dto.recurrence.frequency === RecurrenceFrequency.WEEKLY) {
      const selectedDays = Array.from(new Set(dto.recurrence.daysOfWeek ?? [])).sort();
      let cursor = new Date(start);

      while (dates.length < occurrencesLimit) {
        if (endBoundary && cursor > endBoundary) break;

        const dayOfWeek = cursor.getDay();
        const weekDiff = this.getWeekDifference(start, cursor);
        const isIntervalWeek = weekDiff % dto.recurrence.interval === 0;

        if (isIntervalWeek && selectedDays.includes(dayOfWeek) && cursor >= start) {
          dates.push(new Date(cursor));
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      return dates;
    }

    const anchorDay = start.getDate();
    let monthStep = 0;
    while (dates.length < occurrencesLimit) {
      const monthOffset = monthStep * dto.recurrence.interval;
      const year = start.getFullYear();
      const month = start.getMonth() + monthOffset;
      const monthStart = new Date(year, month, 1);
      const lastDay = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      const day = Math.min(anchorDay, lastDay);

      const candidate = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        day,
        start.getHours(),
        start.getMinutes(),
        0,
        0
      );

      if (candidate >= start) {
        if (endBoundary && candidate > endBoundary) break;
        dates.push(candidate);
      }

      monthStep += 1;
    }

    return dates;
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
      sortBy?: 'dateTime' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
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

    const sortField = filters?.sortBy ?? 'dateTime';
    const sortDirection = filters?.sortOrder === 'desc' ? -1 : 1;
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.sessionModel
        .find(query)
        .populate('coachId', 'email coachProfile')
        .populate('locationId')
        .populate('kids')
        .sort({ [sortField]: sortDirection })
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
      ? s.kids.map((k: any) => {
          if (k && typeof k === 'object' && k._id) {
            return {
              id: k._id.toString(),
              name: k.name,
              gender: k.gender,
            };
          }
          return k?.toString?.() ?? k;
        })
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
    const kids = createSessionDto.kids ?? [];

    if (createSessionDto.type === SessionType.INDIVIDUAL && kids.length < 1) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require at least one kid ID',
      });
    }

    const capacity =
      createSessionDto.capacity ?? (createSessionDto.type === SessionType.GROUP ? 10 : kids.length);

    if (createSessionDto.type === SessionType.GROUP && kids.length > capacity) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_SESSION_CAPACITY,
        message: 'Number of kids exceeds session capacity',
      });
    }

    const coachObjectId = this.toObjectId(createSessionDto.coachId, 'coachId');
    const locationObjectId = this.toObjectId(createSessionDto.locationId, 'locationId');
    const kidObjectIds = this.toObjectIdArray(kids, 'kids');

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

    this.googleCalendarSync
      .syncSessionCreated(sessionIdStr)
      .catch(err =>
        this.logger.warn(`Google Calendar sync failed for session ${sessionIdStr}`, err)
      );

    return this.findById(sessionIdStr);
  }

  async createRecurring(createRecurringSessionDto: CreateRecurringSessionDto, actorId: string) {
    const kids = createRecurringSessionDto.kids ?? [];

    if (createRecurringSessionDto.type === SessionType.INDIVIDUAL && kids.length < 1) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require at least one kid ID',
      });
    }

    const capacity =
      createRecurringSessionDto.capacity ??
      (createRecurringSessionDto.type === SessionType.GROUP ? 10 : kids.length);

    if (createRecurringSessionDto.type === SessionType.GROUP && kids.length > capacity) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_SESSION_CAPACITY,
        message: 'Number of kids exceeds session capacity',
      });
    }

    const dates = this.generateRecurringDates(createRecurringSessionDto);
    if (!dates.length) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Recurring configuration produced no valid session dates',
      });
    }

    const recurringGroupId = randomUUID();
    const coachObjectId = this.toObjectId(createRecurringSessionDto.coachId, 'coachId');
    const locationObjectId = this.toObjectId(createRecurringSessionDto.locationId, 'locationId');
    const kidObjectIds = this.toObjectIdArray(kids, 'kids');

    const docs = dates.map((dateTime, index) => ({
      title: createRecurringSessionDto.title,
      type: createRecurringSessionDto.type,
      coachId: coachObjectId,
      locationId: locationObjectId,
      dateTime,
      duration: createRecurringSessionDto.duration,
      capacity,
      kids: kidObjectIds,
      isFreeSession: createRecurringSessionDto.isFreeSession,
      recurringGroupId,
      recurringIndex: index,
    }));

    const createdSessions = await this.sessionModel.insertMany(docs);

    await this.auditService.log({
      actorId,
      action: 'CREATE_RECURRING_SESSION',
      entityType: 'SessionRecurringGroup',
      entityId: recurringGroupId,
      metadata: {
        totalSessions: createdSessions.length,
        title: createRecurringSessionDto.title,
        recurrence: createRecurringSessionDto.recurrence,
      },
    });

    const parentIds = await this.getParentIdsFromKidIds(kidObjectIds ?? []);
    const coachIdStr = coachObjectId.toString();
    const title = 'Recurring sessions scheduled';
    const body = `${createdSessions.length} recurring sessions for "${createRecurringSessionDto.title}" were scheduled.`;

    await this.notificationService.createNotification({
      userId: coachIdStr,
      type: NotificationType.SESSION_CREATED,
      title,
      body,
      entityType: 'SessionRecurringGroup',
      entityId: recurringGroupId,
    });

    for (const parentId of parentIds) {
      await this.notificationService.createNotification({
        userId: parentId,
        type: NotificationType.SESSION_CREATED,
        title,
        body,
        entityType: 'SessionRecurringGroup',
        entityId: recurringGroupId,
      });
    }

    for (const createdSession of createdSessions) {
      const sessionIdStr = createdSession._id.toString();
      this.googleCalendarSync
        .syncSessionCreated(sessionIdStr)
        .catch(err =>
          this.logger.warn(`Google Calendar sync failed for session ${sessionIdStr}`, err)
        );
    }

    return {
      created: createdSessions.length,
      recurringGroupId,
      sessions: await Promise.all(
        createdSessions.map(session => this.findById(session._id.toString()))
      ),
    };
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
      session.type === SessionType.INDIVIDUAL &&
      updateSessionDto.kids.length < 1
    ) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Individual sessions require at least one kid ID',
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

    const calendarRelevantChanged = Boolean(
      updateSessionDto.title ||
      updateSessionDto.locationId ||
      updateSessionDto.dateTime ||
      updateSessionDto.duration ||
      updateSessionDto.status
    );
    if (calendarRelevantChanged) {
      this.googleCalendarSync
        .syncSessionUpdated(id)
        .catch(err => this.logger.warn(`Google Calendar sync failed for session ${id}`, err));
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

    // Group by day for the chart
    const days: Record<string, number> = {};
    const curr = new Date(startDate);
    while (curr < endDate) {
      days[curr.toISOString().split('T')[0]] = 0;
      curr.setDate(curr.getDate() + 1);
    }

    sessions.forEach(s => {
      const day = s.dateTime.toISOString().split('T')[0];
      if (days[day] !== undefined) {
        days[day]++;
      }
    });

    const chartData = Object.entries(days).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      total: sessions.length,
      chartData,
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

    this.googleCalendarSync
      .syncSessionDeleted(id, session.coachId.toString(), session.kids ?? [])
      .catch(err => this.logger.warn(`Google Calendar sync failed for deleted session ${id}`, err));

    return { message: 'Session deleted successfully' };
  }
}
