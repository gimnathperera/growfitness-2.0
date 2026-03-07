import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleOAuthStateService } from './google-oauth-state.service';

@ApiTags('google-calendar')
@ApiBearerAuth('JWT-auth')
@Controller('auth/google/calendar')
export class GoogleCalendarAuthController {
  constructor(
    private googleCalendarOAuth: GoogleCalendarOAuthService,
    private stateService: GoogleOAuthStateService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Google Calendar OAuth URL' })
  @ApiQuery({
    name: 'redirect_uri',
    required: true,
    type: String,
    description: 'Absolute URL to redirect back to after connect completes (frontend)',
  })
  @ApiResponse({ status: 200, description: 'OAuth URL' })
  async getAuthUrl(@CurrentUser('sub') userId: string, @Query('redirect_uri') redirectUri: string) {
    const url = await this.googleCalendarOAuth.buildAuthUrl(userId, redirectUri);
    return { url };
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Google Calendar OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects back to redirect_uri with connected=1' })
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ) {
    try {
      const { redirectUri } = await this.googleCalendarOAuth.handleCallback(code, state);
      const url = new URL(redirectUri);
      url.searchParams.set('connected', '1');
      return res.redirect(url.toString());
    } catch (e: any) {
      try {
        const payload = this.stateService.verify(state);
        const url = new URL(payload.redirectUri);
        url.searchParams.set('connected', '0');
        url.searchParams.set('error', 'oauth_failed');
        return res.redirect(url.toString());
      } catch {
        return res.redirect('/');
      }
    }
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disconnect Google Calendar' })
  @ApiResponse({ status: 200, description: 'Disconnected' })
  async disconnect(@CurrentUser('sub') userId: string) {
    await this.googleCalendarOAuth.disconnect(userId);
    return { connected: false };
  }
}

