import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import {
  Notification,
  NotificationDocument,
} from '../../infra/database/schemas/notification.schema';
import { NotificationType } from '@grow-fitness/shared-types';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { ErrorCode } from '../../common/enums/error-codes.enum';

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
  email?: string;
  phone?: string;
}

export interface RegistrationApprovedData {
  email: string;
  phone: string;
  parentName?: string;
}

export interface CoachPayoutPaidData {
  email?: string;
  phone: string;
  coachName?: string;
  invoiceId: string;
}

export interface NewInvoiceData {
  email?: string;
  phone: string;
  recipientName?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
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
    if (data.email) {
      await this.emailProvider.send({
        to: data.email,
        subject: 'Invoice Update',
        body: message,
      });
    }
    if (data.phone) {
      await this.whatsAppProvider.send({
        to: data.phone,
        message,
      });
    }
  }

  async sendRegistrationApproved(data: RegistrationApprovedData) {
    const name = data.parentName ?? 'there';
    const message = `Hello ${name}, your Grow Fitness account has been approved. You can now sign in.`;
    const promises: Promise<void>[] = [];
    if (data.email) {
      promises.push(
        this.emailProvider.send({
          to: data.email,
          subject: 'Account Approved',
          body: message,
        })
      );
    }
    if (data.phone) {
      promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
    }
    if (promises.length) await Promise.all(promises);
  }

  async sendCoachPayoutPaid(data: CoachPayoutPaidData) {
    const name = data.coachName ?? 'Coach';
    const message = `Hello ${name}, your monthly payment has been processed.`;
    const promises: Promise<void>[] = [];
    if (data.email) {
      promises.push(
        this.emailProvider.send({
          to: data.email,
          subject: 'Payment Processed',
          body: message,
        })
      );
    }
    if (data.phone) {
      promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
    }
    if (promises.length) await Promise.all(promises);
  }

  async sendNewInvoiceToParent(data: NewInvoiceData) {
    const name = data.recipientName ?? 'there';
    const message = `Hello ${name}, you have a new invoice from Grow Fitness. Please log in to view and pay.`;
    const promises: Promise<void>[] = [];
    if (data.email) {
      promises.push(
        this.emailProvider.send({
          to: data.email,
          subject: 'New Invoice',
          body: message,
        })
      );
    }
    if (data.phone) {
      promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
    }
    if (promises.length) await Promise.all(promises);
  }

  async sendPaymentReminder(data: NewInvoiceData) {
    const name = data.recipientName ?? 'there';
    const message = `Hello ${name}, friendly reminder: you have an outstanding invoice from Grow Fitness. Please log in to view and pay before month end.`;
    const promises: Promise<void>[] = [];
    if (data.email) {
      promises.push(
        this.emailProvider.send({
          to: data.email,
          subject: 'Reminder: Outstanding Invoice',
          body: message,
        })
      );
    }
    if (data.phone) {
      promises.push(this.whatsAppProvider.send({ to: data.phone, message }));
    }
    if (promises.length) await Promise.all(promises);
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
      .updateMany(
        { userId: new Types.ObjectId(userId), read: false },
        { $set: { read: true } }
      )
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
