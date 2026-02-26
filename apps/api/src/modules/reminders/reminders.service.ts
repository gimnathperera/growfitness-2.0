import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { Invoice, InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { NotificationService } from '../notifications/notifications.service';
import { SessionStatus, InvoiceType, InvoiceStatus, UserRole } from '@grow-fitness/shared-types';
import { NotificationType } from '@grow-fitness/shared-types';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    private notificationService: NotificationService
  ) {}

  /**
   * Daily at 9:00 AM: remind admins to create/send invoices for completed sessions.
   */
  @Cron('0 9 * * *', { name: 'invoice-creation-reminder' })
  async remindAdminsToCreateInvoices() {
    this.logger.log('Running invoice creation reminder (admins)');
    try {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const completed = await this.sessionModel
        .countDocuments({
          dateTime: { $gte: start, $lte: end },
          status: SessionStatus.COMPLETED,
        })
        .exec();
      if (completed === 0) return;

      const admins = await this.userModel
        .find({ role: UserRole.ADMIN })
        .select('_id')
        .lean()
        .exec();
      const title = 'Reminder: Create and send invoices';
      const body = `You have ${completed} completed session(s) in the past 7 days. Remember to create and send invoices.`;
      for (const a of admins) {
        const id = (a as any)._id?.toString?.();
        if (id) {
          await this.notificationService.createNotification({
            userId: id,
            type: NotificationType.INVOICE_CREATION_REMINDER,
            title,
            body,
            entityType: 'Session',
          });
        }
      }
    } catch (err) {
      this.logger.error('invoice-creation-reminder failed', err);
    }
  }

  /**
   * Daily at 10:00 AM: remind parents with overdue or soon-due invoices (in-app).
   */
  @Cron('0 10 * * *', { name: 'invoice-payment-reminder' })
  async remindParentsToPayInvoices() {
    this.logger.log('Running invoice payment reminder (parents)');
    try {
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);
      const invoices = await this.invoiceModel
        .find({
          type: InvoiceType.PARENT_INVOICE,
          status: InvoiceStatus.PENDING,
          dueDate: { $lte: inThreeDays },
          parentId: { $exists: true, $ne: null },
        })
        .populate('parentId', 'email phone parentProfile')
        .lean()
        .exec();
      const seen = new Set<string>();
      for (const inv of invoices) {
        const parentId =
          (inv as any).parentId?._id?.toString?.() ?? (inv as any).parentId?.toString?.();
        if (!parentId || seen.has(parentId)) continue;
        seen.add(parentId);
        await this.notificationService.createNotification({
          userId: parentId,
          type: NotificationType.INVOICE_PAYMENT_REMINDER,
          title: 'Reminder: Pay your invoice',
          body: 'You have an outstanding or soon-due invoice. Please log in to view and pay.',
          entityType: 'Invoice',
          entityId: (inv as any)._id?.toString?.(),
        });
      }
    } catch (err) {
      this.logger.error('invoice-payment-reminder failed', err);
    }
  }

  /**
   * 25th of each month at 11:00 AM: month-end payment reminder (WhatsApp + email) to parents with PENDING invoices.
   */
  @Cron('0 11 25 * *', { name: 'month-end-payment-reminder' })
  async sendMonthEndPaymentReminder() {
    this.logger.log('Running month-end payment reminder (parents WhatsApp/email)');
    try {
      const invoices = await this.invoiceModel
        .find({
          type: InvoiceType.PARENT_INVOICE,
          status: InvoiceStatus.PENDING,
          parentId: { $exists: true, $ne: null },
        })
        .populate('parentId', 'email phone parentProfile')
        .lean()
        .exec();
      const seen = new Set<string>();
      for (const inv of invoices) {
        const parent = (inv as any).parentId;
        if (!parent) continue;
        const parentId = parent._id?.toString?.() ?? parent;
        if (typeof parentId !== 'string') continue;
        if (seen.has(parentId)) continue;
        seen.add(parentId);
        const email = parent.email;
        const phone = parent.phone;
        const name = parent.parentProfile?.name;
        if (email || phone) {
          await this.notificationService.sendPaymentReminder({
            email,
            phone: phone ?? '',
            recipientName: name,
          });
        }
        await this.notificationService.createNotification({
          userId: parentId,
          type: NotificationType.MONTH_END_PAYMENT_REMINDER,
          title: 'Month-end reminder: Outstanding invoice',
          body: 'Please pay your outstanding invoice before month end.',
          entityType: 'Invoice',
          entityId: (inv as any)._id?.toString?.(),
        });
      }
    } catch (err) {
      this.logger.error('month-end-payment-reminder failed', err);
    }
  }

  /**
   * Every day at 8:00 AM: upcoming session reminder (next 24h) for parents and coaches.
   */
  @Cron('0 8 * * *', { name: 'upcoming-session-reminder' })
  async sendUpcomingSessionReminder() {
    this.logger.log('Running upcoming session reminder');
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const sessions = await this.sessionModel
        .find({
          dateTime: { $gte: now, $lte: in24h },
          status: { $in: [SessionStatus.SCHEDULED, SessionStatus.CONFIRMED] },
        })
        .populate('coachId', '_id')
        .populate('kids')
        .lean()
        .exec();

      for (const s of sessions) {
        const sessionId = (s as any)._id?.toString?.();
        const title = s.title;
        const dateStr = (s as any).dateTime ? new Date((s as any).dateTime).toLocaleString() : '';

        if ((s as any).coachId?._id) {
          const coachId = (s as any).coachId._id.toString();
          await this.notificationService.createNotification({
            userId: coachId,
            type: NotificationType.UPCOMING_SESSION_REMINDER,
            title: 'Upcoming session',
            body: `Reminder: "${title}" is scheduled within the next 24 hours (${dateStr}).`,
            entityType: 'Session',
            entityId: sessionId,
          });
        }

        const kidIds = (s as any).kids ?? [];
        const objectKidIds = kidIds.map((k: any) =>
          k && typeof k === 'object' && k._id ? k._id : k
        );
        if (objectKidIds.length === 0) continue;
        const kids = await this.kidModel
          .find({ _id: { $in: objectKidIds } })
          .select('parentId')
          .lean()
          .exec();
        const parentIds = new Set<string>();
        for (const k of kids) {
          const pid = (k as any).parentId?.toString?.();
          if (pid) parentIds.add(pid);
        }
        for (const parentId of parentIds) {
          await this.notificationService.createNotification({
            userId: parentId,
            type: NotificationType.UPCOMING_SESSION_REMINDER,
            title: 'Upcoming session',
            body: `Reminder: "${title}" is scheduled within the next 24 hours (${dateStr}).`,
            entityType: 'Session',
            entityId: sessionId,
          });
        }
      }
    } catch (err) {
      this.logger.error('upcoming-session-reminder failed', err);
    }
  }
}
