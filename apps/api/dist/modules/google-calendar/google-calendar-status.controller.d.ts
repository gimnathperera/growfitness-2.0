import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
export declare class GoogleCalendarStatusController {
    private googleCalendarOAuth;
    constructor(googleCalendarOAuth: GoogleCalendarOAuthService);
    status(userId: string): Promise<{
        connected: boolean;
    }>;
}
