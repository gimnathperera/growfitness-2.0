import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailEnabled = this.configService.get<string>('EMAIL_ENABLED', 'false') === 'true';
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = parseInt(this.configService.get<string>('SMTP_PORT', '587'), 10);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpFrom = this.configService.get<string>('SMTP_FROM', smtpUser);

    if (!emailEnabled) {
      this.logger.warn('Email is disabled. Set EMAIL_ENABLED=true to enable email sending.');
      return;
    }

    if (!smtpHost || !smtpUser || !smtpPassword) {
      this.logger.warn(
        'SMTP configuration incomplete. Email sending will be disabled. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.'
      );
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        // Gmail-specific settings
        ...(smtpHost.includes('gmail.com') && {
          service: 'gmail',
        }),
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  async send(data: EmailData): Promise<void> {
    // If email is not configured, fall back to console logging
    if (!this.transporter) {
      this.logger.log('[EMAIL PROVIDER - MOCK MODE]', {
        to: data.to,
        subject: data.subject,
        body: data.body,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const smtpFrom = this.configService.get<string>(
        'SMTP_FROM',
        this.configService.get<string>('SMTP_USER', 'noreply@growfitness.com')
      );

      const mailOptions = {
        from: smtpFrom,
        to: data.to,
        subject: data.subject,
        text: data.body,
        // Optionally add HTML version if needed in the future
        // html: data.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${data.to}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${data.to}:`, error);
      throw error;
    }
  }
}
