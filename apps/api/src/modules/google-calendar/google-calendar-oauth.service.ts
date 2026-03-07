import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { google } from 'googleapis';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { GoogleOAuthStateService } from './google-oauth-state.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class GoogleCalendarOAuthService {
  constructor(
    private configService: ConfigService,
    private stateService: GoogleOAuthStateService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  private validateRedirectUri(redirectUri: string) {
    let url: URL;
    try {
      url = new URL(redirectUri);
    } catch {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'redirect_uri must be a valid absolute URL',
      });
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'redirect_uri must use http or https',
      });
    }

    const corsOrigin = this.configService.get<string>('CORS_ORIGIN', '').trim();
    if (corsOrigin) {
      const allowedOrigins = corsOrigin
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
      if (!allowedOrigins.includes(url.origin)) {
        throw new BadRequestException({
          errorCode: ErrorCode.INVALID_INPUT,
          message: 'redirect_uri origin is not allowed',
        });
      }
    }

    url.hash = '';
    return url.toString();
  }

  private getOauthClient() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_CALENDAR_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message:
          'Google Calendar OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALENDAR_REDIRECT_URI.',
      });
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  async buildAuthUrl(userId: string, redirectUri: string) {
    const normalizedRedirectUri = this.validateRedirectUri(redirectUri);
    const user = await this.userModel
      .findById(userId)
      .select('googleCalendarRefreshToken')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    const oauth2Client = this.getOauthClient();
    const state = this.stateService.sign(
      { userId, redirectUri: normalizedRedirectUri },
      10 * 60 * 1000
    );

    const hasRefreshToken = Boolean((user as any).googleCalendarRefreshToken);

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      ...(hasRefreshToken ? {} : { prompt: 'consent' }),
      state,
    });
  }

  async handleCallback(code: string, state: string) {
    if (!code) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Missing OAuth code',
      });
    }
    if (!state) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Missing OAuth state',
      });
    }

    const payload = this.stateService.verify(state);
    const oauth2Client = this.getOauthClient();

    const tokenResponse = await oauth2Client.getToken(code);
    const refreshToken = tokenResponse.tokens.refresh_token;

    await this.userModel
      .findByIdAndUpdate(payload.userId, {
        ...(refreshToken ? { googleCalendarRefreshToken: refreshToken } : {}),
        googleCalendarConnectedAt: new Date(),
      })
      .exec();

    return { redirectUri: payload.redirectUri };
  }

  async disconnect(userId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $unset: {
          googleCalendarRefreshToken: 1,
          googleCalendarConnectedAt: 1,
        },
      })
      .exec();
  }

  async isConnected(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('googleCalendarRefreshToken')
      .lean()
      .exec();
    return Boolean((user as any)?.googleCalendarRefreshToken);
  }
}

