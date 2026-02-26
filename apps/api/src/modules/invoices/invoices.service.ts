import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { NotificationType } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  async findAll(
    pagination: PaginationDto,
    filters?: {
      type?: InvoiceType;
      parentId?: string;
      coachId?: string;
      status?: InvoiceStatus;
    }
  ) {
    const query: Record<string, unknown> = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.parentId) {
      query.parentId = filters.parentId;
    }

    if (filters?.coachId) {
      query.coachId = filters.coachId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(query)
        .populate('parentId', 'email parentProfile')
        .populate('coachId', 'email coachProfile')
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      this.invoiceModel.countDocuments(query).exec(),
    ]);

    const transformedData = (data as any[]).map(inv => this.toInvoiceResponse(inv));
    return new PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('parentId', 'email parentProfile')
      .populate('coachId', 'email coachProfile')
      .lean()
      .exec();

    if (!invoice) {
      throw new NotFoundException({
        errorCode: ErrorCode.INVOICE_NOT_FOUND,
        message: 'Invoice not found',
      });
    }

    return this.toInvoiceResponse(invoice as any);
  }

  /**
   * Normalize invoice document: keep parentId/coachId as string IDs and expose
   * populated refs as parent and coach.
   */
  private toInvoiceResponse(inv: any) {
    const parentIdVal = inv.parentId?._id ?? inv.parentId;
    const coachIdVal = inv.coachId?._id ?? inv.coachId;
    const parent =
      inv.parentId && typeof inv.parentId === 'object'
        ? {
            id: inv.parentId._id?.toString(),
            email: inv.parentId.email,
            parentProfile: inv.parentId.parentProfile,
          }
        : undefined;
    const coach =
      inv.coachId && typeof inv.coachId === 'object'
        ? {
            id: inv.coachId._id?.toString(),
            email: inv.coachId.email,
            coachProfile: inv.coachId.coachProfile,
          }
        : undefined;
    return {
      id: inv._id?.toString(),
      type: inv.type,
      parentId: parentIdVal != null ? parentIdVal.toString() : undefined,
      coachId: coachIdVal != null ? coachIdVal.toString() : undefined,
      parent,
      coach,
      items: inv.items,
      totalAmount: inv.totalAmount,
      status: inv.status,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      exportFields: inv.exportFields,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  }

  async create(createInvoiceDto: CreateInvoiceDto, actorId: string) {
    const totalAmount = createInvoiceDto.items.reduce((sum, item) => sum + item.amount, 0);

    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      totalAmount,
      dueDate: new Date(createInvoiceDto.dueDate),
      status: InvoiceStatus.PENDING,
    });

    await invoice.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_INVOICE',
      entityType: 'Invoice',
      entityId: invoice._id.toString(),
      metadata: createInvoiceDto,
    });

    const invoiceIdStr = invoice._id.toString();

    if (invoice.type === InvoiceType.PARENT_INVOICE && invoice.parentId) {
      const parentIdStr = invoice.parentId.toString();
      const parent = await this.userModel
        .findById(parentIdStr)
        .select('email phone parentProfile')
        .lean()
        .exec();
      await this.notificationService.createNotification({
        userId: parentIdStr,
        type: NotificationType.INVOICE_CREATED,
        title: 'New invoice',
        body: 'A new invoice has been issued for you. Please log in to view and pay.',
        entityType: 'Invoice',
        entityId: invoiceIdStr,
      });
      if (parent) {
        const p = parent as any;
        await this.notificationService.sendNewInvoiceToParent({
          email: p.email,
          phone: p.phone ?? '',
          recipientName: p.parentProfile?.name,
        });
      }
    }

    if (invoice.type === InvoiceType.COACH_PAYOUT && invoice.coachId) {
      const coachIdStr = invoice.coachId.toString();
      await this.notificationService.createNotification({
        userId: coachIdStr,
        type: NotificationType.INVOICE_CREATED,
        title: 'New payout invoice',
        body: 'A new payout invoice has been created for you.',
        entityType: 'Invoice',
        entityId: invoiceIdStr,
      });
    }

    return this.findById(invoiceIdStr);
  }

  async updatePaymentStatus(id: string, updateDto: UpdateInvoicePaymentStatusDto, actorId: string) {
    const invoice = await this.invoiceModel.findById(id).exec();

    if (!invoice) {
      throw new NotFoundException({
        errorCode: ErrorCode.INVOICE_NOT_FOUND,
        message: 'Invoice not found',
      });
    }

    invoice.status = updateDto.status as InvoiceStatus;
    if (updateDto.status === InvoiceStatus.PAID && updateDto.paidAt) {
      invoice.paidAt = new Date(updateDto.paidAt);
    }

    await invoice.save();

    if (invoice.type === InvoiceType.PARENT_INVOICE && invoice.parentId) {
      const parentIdStr = invoice.parentId.toString();
      const parent = await this.userModel.findById(parentIdStr).select('email phone').lean().exec();
      const email = parent ? (parent as any).email : undefined;
      const phone = parent ? (parent as any).phone : undefined;
      await this.notificationService.sendInvoiceUpdate({
        invoiceId: invoice._id.toString(),
        parentId: parentIdStr,
        status: updateDto.status,
        email,
        phone,
      });
      await this.notificationService.createNotification({
        userId: parentIdStr,
        type: NotificationType.INVOICE_STATUS_UPDATED,
        title: 'Invoice updated',
        body: `Your invoice status has been updated to: ${updateDto.status}.`,
        entityType: 'Invoice',
        entityId: invoice._id.toString(),
      });
    }

    if (invoice.type === InvoiceType.COACH_PAYOUT && invoice.coachId) {
      const coachIdStr = invoice.coachId.toString();
      await this.notificationService.createNotification({
        userId: coachIdStr,
        type: NotificationType.INVOICE_STATUS_UPDATED,
        title: 'Payout invoice updated',
        body:
          updateDto.status === InvoiceStatus.PAID
            ? 'Your payout has been marked as paid.'
            : `Your payout invoice status has been updated to: ${updateDto.status}.`,
        entityType: 'Invoice',
        entityId: invoice._id.toString(),
      });
      if (updateDto.status === InvoiceStatus.PAID) {
        const coach = await this.userModel
          .findById(coachIdStr)
          .select('email phone coachProfile')
          .lean()
          .exec();
        if (coach) {
          const c = coach as any;
          await this.notificationService.sendCoachPayoutPaid({
            email: c.email,
            phone: c.phone ?? '',
            coachName: c.coachProfile?.name,
            invoiceId: invoice._id.toString(),
          });
        }
      }
    }

    await this.auditService.log({
      actorId,
      action: 'UPDATE_INVOICE_PAYMENT_STATUS',
      entityType: 'Invoice',
      entityId: id,
      metadata: updateDto,
    });

    return this.findById(id);
  }

  async getFinanceSummary() {
    const [totalRevenue, pendingAmount, overdueAmount] = await Promise.all([
      this.invoiceModel
        .aggregate([
          { $match: { status: InvoiceStatus.PAID } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          { $match: { status: InvoiceStatus.PENDING } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .exec(),
      this.invoiceModel
        .aggregate([
          {
            $match: {
              status: InvoiceStatus.OVERDUE,
              dueDate: { $lt: new Date() },
            },
          },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .exec(),
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      overdueAmount: overdueAmount[0]?.total || 0,
    };
  }

  async exportCSV(filters?: {
    type?: InvoiceType;
    parentId?: string;
    coachId?: string;
    status?: InvoiceStatus;
  }) {
    const query: Record<string, unknown> = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.parentId) {
      query.parentId = filters.parentId;
    }

    if (filters?.coachId) {
      query.coachId = filters.coachId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const invoices = await this.invoiceModel
      .find(query)
      .populate('parentId')
      .populate('coachId')
      .exec();

    // Simple CSV generation
    const headers = ['ID', 'Type', 'Parent/Coach', 'Total Amount', 'Status', 'Due Date', 'Paid At'];
    const rows = invoices.map(invoice => [
      invoice._id.toString(),
      invoice.type,
      invoice.type === InvoiceType.PARENT_INVOICE
        ? (invoice.parentId as any)?.email || 'N/A'
        : (invoice.coachId as any)?.email || 'N/A',
      invoice.totalAmount,
      invoice.status,
      invoice.dueDate.toISOString(),
      invoice.paidAt?.toISOString() || 'N/A',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return csv;
  }
}
