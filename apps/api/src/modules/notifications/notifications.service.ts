import { Injectable } from '@nestjs/common';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

export interface FreeSessionConfirmationData {
  email: string;
  phone: string;
  parentName: string;
  kidName: string;
  sessionId?: string;
}

export interface SessionChangeData {
  email: string;
  phone: string;
  sessionId: string;
  changes: string;
}

export interface InvoiceUpdateData {
  invoiceId: string;
  parentId: string;
  status: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private emailProvider: EmailProvider,
    private whatsAppProvider: WhatsAppProvider
  ) {}

  async sendFreeSessionConfirmation(data: FreeSessionConfirmationData) {
    const message = `Hello ${data.parentName}, your free session request for ${data.kidName} has been confirmed!`;

    await Promise.all([
      this.emailProvider.send({
        to: data.email,
        subject: 'Free Session Confirmation',
        body: message,
      }),
      this.whatsAppProvider.send({
        to: data.phone,
        message,
      }),
    ]);
  }

  async sendSessionChange(data: SessionChangeData) {
    const message = `Your session has been updated: ${data.changes}`;

    await Promise.all([
      this.emailProvider.send({
        to: data.email,
        subject: 'Session Update',
        body: message,
      }),
      this.whatsAppProvider.send({
        to: data.phone,
        message,
      }),
    ]);
  }

  async sendInvoiceUpdate(data: InvoiceUpdateData) {
    const message = `Your invoice status has been updated to: ${data.status}`;

    // In a real implementation, fetch parent email/phone from database
    // For now, this is a placeholder
    console.log('Invoice update notification:', data);
  }
}

