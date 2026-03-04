import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';
import { normalizeToE164 } from './phone.util';

export interface WhatsAppData {
  to: string;
  message: string;
}

@Injectable()
export class WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);
  private client: Twilio.Twilio | null = null;
  private readonly enabled: boolean;
  private readonly from: string;
  private readonly defaultCountryCode: string;

  constructor(private configService: ConfigService) {
    this.enabled =
      this.configService.get<string>('WHATSAPP_ENABLED', 'false') === 'true';
    this.from =
      this.configService.get<string>('TWILIO_WHATSAPP_FROM', '') || '';
    this.defaultCountryCode =
      this.configService.get<string>('WHATSAPP_DEFAULT_COUNTRY_CODE', '94');

    if (!this.enabled) {
      this.logger.warn(
        'WhatsApp is disabled. Set WHATSAPP_ENABLED=true to enable sending.'
      );
      return;
    }

    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken || !this.from) {
      this.logger.warn(
        'WhatsApp configuration incomplete. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM (e.g. whatsapp:+14155238886). Sending will be mocked.'
      );
      return;
    }

    try {
      this.client = Twilio(accountSid, authToken);
      this.logger.log('WhatsApp (Twilio) client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Twilio client:', error);
      this.client = null;
    }
  }

  async send(data: WhatsAppData): Promise<void> {
    const toE164 = normalizeToE164(data.to, this.defaultCountryCode);
    if (!toE164) {
      this.logger.warn(
        `WhatsApp skip: invalid or empty phone "${data.to?.slice(0, 6)}..."`
      );
      return;
    }

    if (!this.client) {
      this.logger.log('[WHATSAPP PROVIDER - MOCK MODE]', {
        to: toE164,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const toWhatsApp = toE164.startsWith('whatsapp:')
      ? toE164
      : `whatsapp:${toE164}`;

    try {
      const result = await this.client.messages.create({
        from: this.from.startsWith('whatsapp:') ? this.from : `whatsapp:${this.from}`,
        to: toWhatsApp,
        body: data.message,
      });
      this.logger.log(
        `WhatsApp sent successfully to ${toE164}. SID: ${result.sid}`
      );
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${toE164}:`, error);
      throw error;
    }
  }
}
