import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserRole } from '@grow-fitness/shared-types';
import { GoogleCalendarApiService } from './google-calendar-api.service';

@Injectable()
export class GoogleCalendarSyncService {
  private logger = new Logger(GoogleCalendarSyncService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    private googleCalendarApi: GoogleCalendarApiService
  ) {}

  private async getConnectedUserIds(candidateUserIds: string[]) {
    if (!candidateUserIds.length) return [];
    const objectIds = candidateUserIds
      .filter(Boolean)
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    if (!objectIds.length) return [];

    const connected = await this.userModel
      .find({
        _id: { $in: objectIds },
        googleCalendarRefreshToken: { $exists: true, $ne: null },
      })
      .select('_id')
      .lean()
      .exec();

    return connected.map(u => (u as any)._id?.toString?.()).filter(Boolean) as string[];
  }

  private async getConnectedAdminIds() {
    const admins = await this.userModel
      .find({
        role: UserRole.ADMIN,
        googleCalendarRefreshToken: { $exists: true, $ne: null },
      })
      .select('_id')
      .lean()
      .exec();

    return admins.map(a => (a as any)._id?.toString?.()).filter(Boolean) as string[];
  }

  private async getStakeholderUserIds(session: any) {
    const coachId =
      (session.coachId && typeof session.coachId === 'object'
        ? (session.coachId._id?.toString?.() ?? session.coachId.id)
        : session.coachId?.toString?.()) ?? null;

    const parentIds = new Set<string>();
    const kids = Array.isArray(session.kids) ? session.kids : [];
    for (const k of kids) {
      const pid =
        k && typeof k === 'object'
          ? (k.parentId?._id?.toString?.() ?? k.parentId?.toString?.())
          : null;
      if (pid) parentIds.add(pid);
    }

    const adminIds = await this.getConnectedAdminIds();
    const all = [coachId, ...Array.from(parentIds), ...adminIds].filter(Boolean) as string[];
    return Array.from(new Set(all));
  }

  private async fetchSessionForSync(sessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) return null;
    return this.sessionModel
      .findById(sessionId)
      .populate('locationId')
      .populate('kids')
      .lean()
      .exec();
  }

  async syncSessionCreated(sessionId: string) {
    try {
      const session = await this.fetchSessionForSync(sessionId);
      if (!session) return;

      const stakeholderIds = await this.getStakeholderUserIds(session);
      const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);

      for (const userId of connectedStakeholders) {
        try {
          await this.googleCalendarApi.upsertSessionEvent(userId, session as any);
        } catch (e) {
          this.logger.warn(
            `Google Calendar sync (create) failed for user ${userId}, session ${sessionId}`,
            e
          );
        }
      }
    } catch (e) {
      this.logger.warn(`Google Calendar sync (create) failed for session ${sessionId}`, e);
    }
  }

  async syncSessionUpdated(sessionId: string) {
    try {
      const session = await this.fetchSessionForSync(sessionId);
      if (!session) return;

      const stakeholderIds = await this.getStakeholderUserIds(session);
      const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);

      for (const userId of connectedStakeholders) {
        try {
          await this.googleCalendarApi.upsertSessionEvent(userId, session as any);
        } catch (e) {
          this.logger.warn(
            `Google Calendar sync (update) failed for user ${userId}, session ${sessionId}`,
            e
          );
        }
      }
    } catch (e) {
      this.logger.warn(`Google Calendar sync (update) failed for session ${sessionId}`, e);
    }
  }

  async syncSessionDeleted(sessionId: string, coachId: string, kidObjectIds: Types.ObjectId[]) {
    try {
      const parentIds = await this.getParentIdsFromKidObjectIds(kidObjectIds);
      const adminIds = await this.getConnectedAdminIds();
      const stakeholderIds = Array.from(
        new Set([coachId, ...parentIds, ...adminIds].filter(Boolean))
      );
      const connectedStakeholders = await this.getConnectedUserIds(stakeholderIds);

      const sessionObjectId = new Types.ObjectId(sessionId);
      for (const userId of connectedStakeholders) {
        try {
          await this.googleCalendarApi.deleteSessionEvent(userId, sessionObjectId);
        } catch (e) {
          this.logger.warn(
            `Google Calendar sync (delete) failed for user ${userId}, session ${sessionId}`,
            e
          );
        }
      }
    } catch (e) {
      this.logger.warn(`Google Calendar sync (delete) failed for session ${sessionId}`, e);
    }
  }

  private async getParentIdsFromKidObjectIds(kidObjectIds: Types.ObjectId[]) {
    if (!kidObjectIds?.length) return [];
    const kids = await this.kidModel
      .find({ _id: { $in: kidObjectIds } })
      .select('parentId')
      .lean()
      .exec();
    const parentIds = new Set<string>();
    for (const k of kids as any[]) {
      const pid = k?.parentId?.toString?.() ?? k?.parentId;
      if (pid) parentIds.add(pid);
    }
    return Array.from(parentIds);
  }
}
