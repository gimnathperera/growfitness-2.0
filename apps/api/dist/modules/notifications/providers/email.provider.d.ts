import { ConfigService } from '@nestjs/config';
export interface EmailData {
    to: string;
    subject: string;
    body: string;
}
export declare class EmailProvider {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    send(data: EmailData): Promise<void>;
}
