import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { UserDocument } from '../../infra/database/schemas/user.schema';

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
    private whatsAppProvider: WhatsAppProvider,
    private configService: ConfigService
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

  async sendPasswordResetEmail(user: UserDocument, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const userName = user.parentProfile?.name || user.coachProfile?.name || 'User';
    const expiryHours = parseInt(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRY', '3600'),
      10
    ) / 3600;

    const subject = 'Reset Your Password';
    const body = `Hello ${userName},

You requested to reset your password for your Grow Fitness account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}.

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, please do not share this link with anyone.

Best regards,
Grow Fitness Team`;

    await this.emailProvider.send({
      to: user.email,
      subject,
      body,
    });
  }
}
