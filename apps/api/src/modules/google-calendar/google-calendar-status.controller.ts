import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';

@ApiTags('google-calendar')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class GoogleCalendarStatusController {
  constructor(private googleCalendarOAuth: GoogleCalendarOAuthService) {}

  @Get('calendar-status')
  @ApiOperation({ summary: 'Get Google Calendar connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async status(@CurrentUser('sub') userId: string) {
    const connected = await this.googleCalendarOAuth.isConnected(userId);
    return { connected };
  }
}

