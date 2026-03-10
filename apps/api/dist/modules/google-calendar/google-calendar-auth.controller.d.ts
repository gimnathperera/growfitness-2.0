import { Response } from 'express';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleOAuthStateService } from './google-oauth-state.service';
export declare class GoogleCalendarAuthController {
    private googleCalendarOAuth;
    private stateService;
    constructor(googleCalendarOAuth: GoogleCalendarOAuthService, stateService: GoogleOAuthStateService);
    getAuthUrl(userId: string, redirectUri: string): Promise<{
        url: string;
    }>;
    callback(code: string, state: string, res: Response): Promise<void>;
    disconnect(userId: string): Promise<{
        connected: boolean;
    }>;
}
