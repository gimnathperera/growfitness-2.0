import { Injectable } from '@nestjs/common';

export interface WhatsAppData {
  to: string;
  message: string;
}

@Injectable()
export class WhatsAppProvider {
  async send(data: WhatsAppData): Promise<void> {
    // Mock implementation - in dev, just log
    console.log('[WHATSAPP PROVIDER]', {
      to: data.to,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // In production, integrate with WhatsApp Business API or Twilio
  }
}

