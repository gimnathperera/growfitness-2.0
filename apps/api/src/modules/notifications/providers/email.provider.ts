import { Injectable } from '@nestjs/common';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailProvider {
  async send(data: EmailData): Promise<void> {
    // Mock implementation - in dev, just log
    console.log('[EMAIL PROVIDER]', {
      to: data.to,
      subject: data.subject,
      body: data.body,
      timestamp: new Date().toISOString(),
    });

    // In production, integrate with actual email service (SendGrid, AWS SES, etc.)
  }
}

