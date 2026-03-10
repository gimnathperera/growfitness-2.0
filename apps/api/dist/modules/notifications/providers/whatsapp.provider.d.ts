import { ConfigService } from '@nestjs/config';
export interface WhatsAppData {
    to: string;
    message: string;
}
export declare class WhatsAppProvider {
    private configService;
    private readonly logger;
    private client;
    private readonly enabled;
    private readonly from;
    private readonly defaultCountryCode;
    constructor(configService: ConfigService);
    send(data: WhatsAppData): Promise<void>;
}
