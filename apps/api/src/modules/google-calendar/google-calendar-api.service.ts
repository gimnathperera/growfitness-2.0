import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { google } from 'googleapis';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import {
  GoogleCalendarEvent,
  GoogleCalendarEventDocument,
} from '../../infra/database/schemas/google-calendar-event.schema';

type SessionLike = {
  _id: Types.ObjectId;
  title: string;
  type: string;
  status: string;
  dateTime: Date;
  duration: number;
  locationId?: any;
};

@Injectable()
export class GoogleCalendarApiService {
  private logger = new Logger(GoogleCalendarApiService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(GoogleCalendarEvent.name)
    private mappingModel: Model<GoogleCalendarEventDocument>
  ) {}

  private getOauthClientForRefreshToken(refreshToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_CALENDAR_REDIRECT_URI');
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error(
        'Google Calendar OAuth not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_CALENDAR_REDIRECT_URI)'
      );
    }
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  private buildEvent(session: SessionLike) {
    const start = new Date(session.dateTime);
    const end = new Date(start.getTime() + session.duration * 60_000);

    const locationName = session.locationId?.name as string | undefined;
    const locationAddress = session.locationId?.address as string | undefined;
    const location = [locationName, locationAddress].filter(Boolean).join(' - ') || undefined;

    const descriptionLines = [
      'Grow Fitness session',
      `Type: ${session.type}`,
      `Status: ${session.status}`,
      `SessionId: ${session._id.toString()}`,
    ];

    return {
      summary: session.title,
      description: descriptionLines.join('\n'),
      ...(location ? { location } : {}),
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    };
  }

  private async getUserRefreshToken(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('googleCalendarRefreshToken')
      .lean()
      .exec();
    return (user as any)?.googleCalendarRefreshToken as string | undefined;
  }

  private async getMapping(userId: string, sessionObjectId: Types.ObjectId) {
    return this.mappingModel
      .findOne({ userId: new Types.ObjectId(userId), sessionId: sessionObjectId })
      .lean()
      .exec();
  }

  private async setMapping(userId: string, sessionObjectId: Types.ObjectId, googleEventId: string) {
    await this.mappingModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId), sessionId: sessionObjectId },
        { userId: new Types.ObjectId(userId), sessionId: sessionObjectId, googleEventId },
        { upsert: true, new: true }
      )
      .exec();
  }

  private async removeMapping(userId: string, sessionObjectId: Types.ObjectId) {
    await this.mappingModel
      .deleteOne({ userId: new Types.ObjectId(userId), sessionId: sessionObjectId })
      .exec();
  }

  /** Returns true if the error indicates the refresh token is invalid/revoked (invalid_grant) */
  private isInvalidGrantError(e: unknown): boolean {
    const msg = String((e as { message?: string })?.message ?? '').toLowerCase();
    const dataError = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
    return msg.includes('invalid_grant') || dataError === 'invalid_grant';
  }

  /** Clear the user's Google Calendar token so they can reconnect. Prevents repeated invalid_grant failures. */
  private async clearUserRefreshToken(userId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $unset: { googleCalendarRefreshToken: 1, googleCalendarConnectedAt: 1 },
      })
      .exec();
    this.logger.warn(
      `Cleared Google Calendar token for user ${userId} due to invalid_grant. User must reconnect.`
    );
  }

  async upsertSessionEvent(userId: string, session: SessionLike) {
    const refreshToken = await this.getUserRefreshToken(userId);
    if (!refreshToken) return;

    const oauth2Client = this.getOauthClientForRefreshToken(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const sessionObjectId = session._id;
    const mapping = await this.getMapping(userId, sessionObjectId);
    const event = this.buildEvent(session);

    try {
      if (!mapping?.googleEventId) {
        const created = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        });
        const googleEventId = created.data.id;
        if (googleEventId) {
          await this.setMapping(userId, sessionObjectId, googleEventId);
        }
        return;
      }

      await calendar.events.patch({
        calendarId: 'primary',
        eventId: mapping.googleEventId,
        requestBody: event,
      });
    } catch (e: unknown) {
      if (this.isInvalidGrantError(e)) {
        await this.clearUserRefreshToken(userId);
        throw e;
      }
      const err = e as { code?: number; response?: { status?: number } };
      const status = err?.code ?? err?.response?.status;
      if (status === 404 && mapping?.googleEventId) {
        // Event missing in Google Calendar; recreate and overwrite mapping.
        try {
          const created = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
          });
          const googleEventId = created.data.id;
          if (googleEventId) {
            await this.setMapping(userId, sessionObjectId, googleEventId);
          }
          return;
        } catch (retryErr: unknown) {
          if (this.isInvalidGrantError(retryErr)) {
            await this.clearUserRefreshToken(userId);
          }
          this.logger.warn(`Failed to recreate Google Calendar event for user ${userId}`, retryErr);
          throw retryErr;
        }
      }
      this.logger.warn(`Failed to upsert Google Calendar event for user ${userId}`, e);
      throw e;
    }
  }

  async deleteSessionEvent(userId: string, sessionObjectId: Types.ObjectId) {
    const refreshToken = await this.getUserRefreshToken(userId);
    if (!refreshToken) return;

    const mapping = await this.getMapping(userId, sessionObjectId);
    if (!mapping?.googleEventId) {
      await this.removeMapping(userId, sessionObjectId);
      return;
    }

    const oauth2Client = this.getOauthClientForRefreshToken(refreshToken);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: mapping.googleEventId,
      });
    } catch (e: unknown) {
      if (this.isInvalidGrantError(e)) {
        await this.clearUserRefreshToken(userId);
      }
      const status = (e as { code?: number; response?: { status?: number } })?.code ?? (e as { response?: { status?: number } })?.response?.status;
      if (status !== 404) {
        this.logger.warn(`Failed to delete Google Calendar event for user ${userId}`, e);
      }
    } finally {
      await this.removeMapping(userId, sessionObjectId);
    }
  }
}
