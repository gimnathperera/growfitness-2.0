import { ConfigService } from '@nestjs/config';
type StatePayload = {
    userId: string;
    redirectUri: string;
    exp: number;
};
export declare class GoogleOAuthStateService {
    private configService;
    constructor(configService: ConfigService);
    private getSecret;
    sign(payload: {
        userId: string;
        redirectUri: string;
    }, ttlMs: number): string;
    verify(state: string): StatePayload;
}
export {};
