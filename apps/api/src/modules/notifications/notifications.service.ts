import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './providers/email.provider';
import { TextLkProvider } from './providers/textlk.provider';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import {
  Notification,
  NotificationDocument,
} from '../../infra/database/schemas/notification.schema';
import { NotificationType } from '@grow-fitness/shared-types';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { getPasswordResetTokenExpirySeconds } from '../../common/utils/password-reset-config.util';
import { resolveClientWebUrl } from '../../common/utils/client-web-url.util';
import {
  getPasswordResetEmail,
  getCoachAccountCreatedEmail,
  getCoachAccountCreatedSMS,
  getParentRegistrationReceivedEmail,
  getParentRegistrationApprovedEmail,
  getParentRegistrationApprovedSMS,
  getParentRegistrationRejectedEmail,
  getParentRegistrationRejectedSMS,
  getFreeSessionConfirmationEmail,
  getFreeSessionConfirmationSMS,
  getSessionUpdateEmail,
  getSessionUpdateSMS,
  getSessionCancelledEmail,
  getSessionCancelledSMS,
  getSessionDeletedEmail,
  getSessionDeletedSMS,
  getNewInvoiceEmail,
  getNewInvoiceSMS,
  getInvoiceUpdateEmail,
  getInvoiceUpdateSMS,
  getCoachPayoutPaidEmail,
  getCoachPayoutPaidSMS,
  getPaymentReminderEmail,
  getPaymentReminderSMS,
  getHtmlTemplate,
} from './notification-templates';

export interface CreateInAppNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
}

export interface FreeSessionConfirmationData {
  email: string;
  phone: string;
  parentName: string;
  kidName: string;
  sessionId?: string;
  sessionTitle?: string;
  dateTime?: Date;
  locationName?: string;
  locationAddress?: string;
}

export interface SessionChangeData {
  email: string;
  phone: string;
  sessionId: string;
  changes: string;
  sessionTitle?: string;
  dateTime?: Date;
  locationName?: string;
}

export interface InvoiceUpdateData {
  invoiceId: string;
  parentId: string;
  status: string;
  email?: string;
  phone?: string;
  recipientName?: string;
  amount?: number;
}

export interface RegistrationApprovedData {
  email: string;
  phone: string;
  parentName?: string;
}

export interface RegistrationEmailData {
  email?: string;
  phone?: string;
  parentName?: string;
}

export interface CoachAccountCreatedData {
  email: string;
  phone: string;
  coachName?: string;
}

export interface CoachPayoutPaidData {
  email?: string;
  phone: string;
  coachName?: string;
  invoiceId: string;
  amount?: number;
}

export interface NewInvoiceData {
  email?: string;
  phone: string;
  recipientName?: string;
  invoiceId?: string;
  amount?: number;
  dueDate?: Date;
}

export interface ParentPaymentReceiptData {
  email?: string;
  parentName?: string;
  invoiceId: string;
  status: string;
  totalAmount?: number;
  paidAt?: Date;
}

export interface AdminPaymentReceivedData {
  email?: string;
  parentName: string;
  invoiceId: string;
  amount?: number;
}

export interface UrgentSessionCancellationData {
  email?: string;
  phone?: string;
  title: string;
  date: string;
  recipientName?: string;
  dateTime?: Date;
  locationName?: string;
}

export interface SendInvoicePdfEmailParams {
  to: string;
  recipientName?: string;
  pdfBuffer: Buffer;
  filename: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private emailProvider: EmailProvider,
    private textLkProvider: TextLkProvider,
    private configService: ConfigService
  ) {}

  /** Parent/coach app base URL for links in emails (CLIENT_WEB_URL or FRONTEND_URL). */
  private getClientWebUrl(): string {
    return resolveClientWebUrl(
      this.configService.get<string>('CLIENT_WEB_URL'),
      this.configService.get<string>('FRONTEND_URL')
    );
  }

  async sendFreeSessionConfirmation(data: FreeSessionConfirmationData) {
    const parentName = data.parentName || 'Parent';
    const kidName = data.kidName || 'Child';
    const dateTimeStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : 'TBD';
    const locationName = data.locationName || 'Grow Fitness Center';
    const locationAddress = data.locationAddress || '';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getFreeSessionConfirmationEmail(
      parentName,
      kidName,
      dateTimeStr,
      locationName,
      locationAddress,
      portalUrl
    );
    const smsMessage = getFreeSessionConfirmationSMS(
      parentName,
      kidName,
      dateTimeStr,
      locationName,
      locationAddress,
      portalUrl
    );

    const tasks: Promise<void>[] = [];
    tasks.push(
      this.emailProvider
        .send({
          to: data.email,
          subject: emailTemplate.subject,
          body: emailTemplate.text,
          html: emailTemplate.html,
        })
        .catch(err => this.logger.error(`Failed to send free session confirmation email to ${data.email}`, err))
    );
    tasks.push(
      this.textLkProvider
        .send({
          to: data.phone,
          message: smsMessage,
        })
        .catch(err => this.logger.error(`Failed to send free session confirmation SMS to ${data.phone}`, err))
    );
    await Promise.all(tasks);
  }

  async sendSessionChange(data: SessionChangeData) {
    const sessionTitle = data.sessionTitle || 'Scheduled Session';
    const dateTimeStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : 'TBD';
    const locationName = data.locationName || 'Grow Fitness Center';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getSessionUpdateEmail(
      'there',
      sessionTitle,
      dateTimeStr,
      locationName,
      data.changes
    );
    const smsMessage = getSessionUpdateSMS(
      sessionTitle,
      dateTimeStr,
      data.changes,
      portalUrl
    );

    const tasks: Promise<void>[] = [];
    tasks.push(
      this.emailProvider
        .send({
          to: data.email,
          subject: emailTemplate.subject,
          body: emailTemplate.text,
          html: emailTemplate.html,
        })
        .catch(err => this.logger.error(`Failed to send session change email to ${data.email}`, err))
    );
    tasks.push(
      this.textLkProvider
        .send({
          to: data.phone,
          message: smsMessage,
        })
        .catch(err => this.logger.error(`Failed to send session change SMS to ${data.phone}`, err))
    );
    await Promise.all(tasks);
  }

  async sendSessionCancelled(data: {
    email: string;
    phone: string;
    recipientName: string;
    sessionTitle: string;
    dateTime: Date;
    locationName: string;
  }) {
    const name = data.recipientName || 'there';
    const dateTimeStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : 'TBD';
    const locationName = data.locationName || 'Grow Fitness Center';

    const emailTemplate = getSessionCancelledEmail(name, data.sessionTitle, dateTimeStr, locationName);
    const smsMessage = getSessionCancelledSMS(data.sessionTitle, dateTimeStr);

    const tasks: Promise<void>[] = [];
    tasks.push(
      this.emailProvider
        .send({
          to: data.email,
          subject: emailTemplate.subject,
          body: emailTemplate.text,
          html: emailTemplate.html,
        })
        .catch(err => this.logger.error(`Failed to send session cancelled email to ${data.email}`, err))
    );
    tasks.push(
      this.textLkProvider
        .send({
          to: data.phone,
          message: smsMessage,
        })
        .catch(err => this.logger.error(`Failed to send session cancelled SMS to ${data.phone}`, err))
    );
    await Promise.all(tasks);
  }

  async sendSessionDeleted(data: {
    email: string;
    phone: string;
    recipientName: string;
    sessionTitle: string;
    dateTime: Date;
    locationName: string;
  }) {
    const name = data.recipientName || 'there';
    const dateTimeStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : 'TBD';
    const locationName = data.locationName || 'Grow Fitness Center';

    const emailTemplate = getSessionDeletedEmail(name, data.sessionTitle, dateTimeStr, locationName);
    const smsMessage = getSessionDeletedSMS(data.sessionTitle, dateTimeStr);

    const tasks: Promise<void>[] = [];
    tasks.push(
      this.emailProvider
        .send({
          to: data.email,
          subject: emailTemplate.subject,
          body: emailTemplate.text,
          html: emailTemplate.html,
        })
        .catch(err => this.logger.error(`Failed to send session deleted email to ${data.email}`, err))
    );
    tasks.push(
      this.textLkProvider
        .send({
          to: data.phone,
          message: smsMessage,
        })
        .catch(err => this.logger.error(`Failed to send session deleted SMS to ${data.phone}`, err))
    );
    await Promise.all(tasks);
  }

  async sendInvoiceUpdate(data: InvoiceUpdateData) {
    const recipientName = data.recipientName || 'Parent';
    const amount = data.amount || 0;
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getInvoiceUpdateEmail(
      recipientName,
      data.invoiceId,
      data.status,
      amount,
      portalUrl
    );
    const smsMessage = getInvoiceUpdateSMS(
      data.invoiceId,
      data.status,
      portalUrl
    );

    if (data.email) {
      await this.emailProvider
        .send({
          to: data.email,
          subject: emailTemplate.subject,
          body: emailTemplate.text,
          html: emailTemplate.html,
        })
        .catch(err => this.logger.error(`Failed to send invoice update email to ${data.email}`, err));
    }
    if (data.phone) {
      await this.textLkProvider
        .send({
          to: data.phone,
          message: smsMessage,
        })
        .catch(err => this.logger.error(`Failed to send invoice update SMS to ${data.phone}`, err));
    }
  }

  async sendRegistrationApproved(data: RegistrationApprovedData) {
    const name = data.parentName ?? 'Parent';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getParentRegistrationApprovedEmail(name, portalUrl);
    const smsMessage = getParentRegistrationApprovedSMS(name, portalUrl);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err => this.logger.error(`Failed to send registration approval email to ${data.email}`, err))
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err => this.logger.error(`Failed to send registration approval SMS to ${data.phone}`, err))
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async sendRegistrationReceived(data: RegistrationEmailData) {
    if (!data.email) return;
    const name = data.parentName?.trim() || 'Parent';
    const emailTemplate = getParentRegistrationReceivedEmail(name);

    await this.emailProvider
      .send({
        to: data.email,
        subject: emailTemplate.subject,
        body: emailTemplate.text,
        html: emailTemplate.html,
      })
      .catch(err =>
        this.logger.error(`Failed to send registration received email to ${data.email}`, err)
      );
  }

  async sendRegistrationRejected(data: RegistrationEmailData) {
    const name = data.parentName?.trim() || 'Parent';
    const emailTemplate = getParentRegistrationRejectedEmail(name);
    const smsMessage = getParentRegistrationRejectedSMS(name);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err => this.logger.error(`Failed to send registration rejection email to ${data.email}`, err))
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err => this.logger.error(`Failed to send registration rejection SMS to ${data.phone}`, err))
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  /**
   * Welcome email + SMS when an admin creates a coach account.
   */
  async sendCoachAccountCreated(data: CoachAccountCreatedData) {
    const name = data.coachName?.trim() || 'Coach';
    const loginUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getCoachAccountCreatedEmail(name, data.email, loginUrl);
    const smsMessage = getCoachAccountCreatedSMS(name, loginUrl);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err =>
            this.logger.error(`Failed to send coach welcome email to ${data.email}`, err)
          )
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err =>
            this.logger.error(`Failed to send coach welcome SMS to ${data.phone}`, err)
          )
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async sendCoachPayoutPaid(data: CoachPayoutPaidData) {
    const name = data.coachName ?? 'Coach';
    const amount = data.amount || 0;
    const paymentDateStr = new Date().toLocaleDateString();

    const emailTemplate = getCoachPayoutPaidEmail(name, data.invoiceId, amount, paymentDateStr);
    const smsMessage = getCoachPayoutPaidSMS(name, data.invoiceId, amount);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err => this.logger.error(`Failed to send payout email to ${data.email}`, err))
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err => this.logger.error(`Failed to send payout SMS to ${data.phone}`, err))
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async sendInvoicePdfEmail(params: SendInvoicePdfEmailParams): Promise<void> {
    const name = params.recipientName?.trim() || 'Parent';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const title = 'Your Grow Fitness Invoice';
    const greeting = `Hello ${name},`;
    const body = `
      <p>Please find your Grow Fitness invoice attached as a PDF document.</p>
      <p>You can also log in to the Parent Portal to check your account details, session schedules, and invoices at any time.</p>
    `;
    const emailHtml = getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'Go to Portal' });
    const emailText = `Hello ${name}, please find your Grow Fitness invoice attached as a PDF.`;

    await this.emailProvider.send({
      to: params.to,
      subject: 'Your Grow Fitness invoice',
      body: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: params.filename,
          content: params.pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendNewInvoiceToParent(data: NewInvoiceData) {
    const name = data.recipientName ?? 'Parent';
    const invoiceId = data.invoiceId ?? '';
    const amount = data.amount ?? 0;
    const dueDateStr = data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'TBD';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getNewInvoiceEmail(name, invoiceId, amount, dueDateStr, portalUrl);
    const smsMessage = getNewInvoiceSMS(invoiceId, amount, dueDateStr, portalUrl);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err => this.logger.error(`Failed to send new invoice email to ${data.email}`, err))
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err => this.logger.error(`Failed to send new invoice SMS to ${data.phone}`, err))
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async sendNewInvoiceSmsToParent(data: NewInvoiceData) {
    await this.sendNewInvoiceToParent({ ...data, email: undefined });
  }

  async sendPaymentReceiptToParent(data: ParentPaymentReceiptData) {
    if (!data.email) return;
    const details = [
      `Invoice: #${data.invoiceId}`,
      `Status: ${data.status}`,
      data.totalAmount !== undefined ? `Amount: ${data.totalAmount}` : undefined,
      data.paidAt ? `Paid at: ${data.paidAt.toISOString()}` : undefined,
    ].filter(Boolean);
    const body = `Thank you! We have received your payment. Your receipt details are enclosed.

${details.join('\n')}`;
    await this.emailProvider
      .send({
        to: data.email,
        subject: `Payment Receipt for Invoice #${data.invoiceId}`,
        body,
      })
      .catch(err => this.logger.error(`Failed to send payment receipt email to ${data.email}`, err));
  }

  async sendAdminPaymentReceived(data: AdminPaymentReceivedData) {
    if (!data.email) return;
    const amountDetails = data.amount !== undefined ? ` Amount: ${data.amount}.` : '';
    const message = `Parent ${data.parentName} has successfully paid Invoice #${data.invoiceId}.${amountDetails}`;
    await this.emailProvider
      .send({
        to: data.email,
        subject: 'Payment Received',
        body: message,
      })
      .catch(err =>
        this.logger.error(`Failed to send admin payment received email to ${data.email}`, err)
      );
  }

  async sendUrgentSessionCancellation(data: UrgentSessionCancellationData) {
    const recipientName = data.recipientName ?? 'there';
    const dateTimeStr = data.dateTime ? new Date(data.dateTime).toLocaleString() : data.date;
    const locationName = data.locationName ?? 'Grow Fitness Center';
    const emailTemplate = getSessionCancelledEmail(
      recipientName,
      data.title,
      dateTimeStr,
      locationName
    );
    const smsMessage = getSessionCancelledSMS(data.title, dateTimeStr);
    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err =>
            this.logger.error(`Failed to send urgent cancellation email to ${data.email}`, err)
          )
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err =>
            this.logger.error(`Failed to send urgent cancellation SMS to ${data.phone}`, err)
          )
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async sendPaymentReminder(data: NewInvoiceData) {
    const name = data.recipientName ?? 'Parent';
    const invoiceId = data.invoiceId ?? '';
    const amount = data.amount ?? 0;
    const dueDateStr = data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'TBD';
    const portalUrl = `${this.getClientWebUrl()}/login`;

    const emailTemplate = getPaymentReminderEmail(name, invoiceId, amount, dueDateStr, portalUrl);
    const smsMessage = getPaymentReminderSMS(invoiceId, amount, dueDateStr, portalUrl);

    const tasks: Promise<void>[] = [];
    if (data.email) {
      tasks.push(
        this.emailProvider
          .send({
            to: data.email,
            subject: emailTemplate.subject,
            body: emailTemplate.text,
            html: emailTemplate.html,
          })
          .catch(err => this.logger.error(`Failed to send payment reminder email to ${data.email}`, err))
      );
    }
    if (data.phone) {
      tasks.push(
        this.textLkProvider
          .send({ to: data.phone, message: smsMessage })
          .catch(err => this.logger.error(`Failed to send payment reminder SMS to ${data.phone}`, err))
      );
    }
    if (tasks.length) await Promise.all(tasks);
  }

  async createNotification(dto: CreateInAppNotificationDto): Promise<NotificationDocument> {
    const doc = new this.notificationModel({
      userId: new Types.ObjectId(dto.userId),
      type: dto.type,
      title: dto.title,
      body: dto.body,
      read: false,
      ...(dto.entityType && { entityType: dto.entityType }),
      ...(dto.entityId && { entityId: dto.entityId }),
    });
    return doc.save();
  }

  async findAllForUser(
    userId: string,
    pagination: PaginationDto,
    filter?: { read?: boolean }
  ): Promise<PaginatedResponseDto<NotificationDocument>> {
    const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (filter?.read !== undefined) {
      query.read = filter.read;
    }
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);
    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationModel
      .countDocuments({ userId: new Types.ObjectId(userId), read: false })
      .exec();
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
        { $set: { read: true } },
        { new: true }
      )
      .exec();
    if (!notification) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Notification not found',
      });
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.notificationModel
      .updateMany({ userId: new Types.ObjectId(userId), read: false }, { $set: { read: true } })
      .exec();
    return { count: result.modifiedCount };
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    const result = await this.notificationModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    if (!result) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Notification not found',
      });
    }
  }

  async deleteAll(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel
      .deleteMany({ userId: new Types.ObjectId(userId) })
      .exec();
    return { deletedCount: result.deletedCount };
  }

  async sendPasswordResetEmail(user: UserDocument, resetToken: string): Promise<void> {
    const resetUrl = `${this.getClientWebUrl()}/reset-password?token=${resetToken}`;

    const userName = user.parentProfile?.name || user.coachProfile?.name || 'User';
    const expirySeconds = getPasswordResetTokenExpirySeconds(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRY')
    );
    const expiryHours = expirySeconds / 3600;

    const emailTemplate = getPasswordResetEmail(userName, resetUrl, expiryHours);

    await this.emailProvider.send({
      to: user.email,
      subject: emailTemplate.subject,
      body: emailTemplate.text,
      html: emailTemplate.html,
    });
  }
}
