import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { GoogleOAuthStateService } from './google-oauth-state.service';
export declare class GoogleCalendarOAuthService {
    private configService;
    private stateService;
    private userModel;
    constructor(configService: ConfigService, stateService: GoogleOAuthStateService, userModel: Model<UserDocument>);
    private validateRedirectUri;
    private getOauthClient;
    buildAuthUrl(userId: string, redirectUri: string): Promise<string>;
    handleCallback(code: string, state: string): Promise<{
        redirectUri: string;
    }>;
    disconnect(userId: string): Promise<void>;
    isConnected(userId: string): Promise<boolean>;
}
