import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { InvoiceType, InvoiceStatus, UserRole } from '@grow-fitness/shared-types';
import { NotificationType } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import type { JwtPayload } from '../auth/auth.service';
import { InvoicePdfSentFilter } from './dto/get-invoices-query.dto';
import type { InvoiceSortField } from './dto/get-invoices-query.dto';

function buildInvoiceSort(
  sortBy?: InvoiceSortField,
  sortOrder?: 'asc' | 'desc'
): Record<string, 1 | -1> {
  const direction = sortOrder === 'desc' ? -1 : 1;
  const sortFields: Record<InvoiceSortField, string> = {
    type: 'type',
    recipient: 'recipientSort',
    totalAmount: 'totalAmount',
    status: 'status',
    pdfEmailedAt: 'pdfEmailedAt',
    dueDate: 'dueDate',
    createdAt: 'createdAt',
  };

  if (!sortBy) {
    return { dueDate: 1, _id: 1 };
  }

  return { [sortFields[sortBy]]: direction, _id: 1 };
}

@Injectable()
export class InvoicesService {
  private applyPdfSentFilter(
    query: Record<string, unknown>,
    pdfSent?: InvoicePdfSentFilter,
    recipientVisibleOnly?: boolean
  ): void {
    if (recipientVisibleOnly) {
      query.pdfEmailedAt = { $exists: true, $ne: null };
      return;
    }

    if (pdfSent === InvoicePdfSentFilter.SENT) {
      query.pdfEmailedAt = { $exists: true, $ne: null };
    } else if (pdfSent === InvoicePdfSentFilter.NOT_SENT) {
      query.$or = [{ pdfEmailedAt: { $exists: false } }, { pdfEmailedAt: null }];
    }
  }
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  /**
   * List invoices. Parents/coaches are scoped to their own records (ignores spoofed query params).
   */
  async findAllForActor(
    pagination: PaginationDto,
    filters:
      | {
          type?: InvoiceType;
          parentId?: string;
          coachId?: string;
          status?: InvoiceStatus;
          pdfSent?: InvoicePdfSentFilter;
          sortBy?: InvoiceSortField;
          sortOrder?: 'asc' | 'desc';
        }
      | undefined,
    actor: JwtPayload
  ) {
    const scoped = { ...(filters ?? {}) };
    let recipientVisibleOnly = false;
    if (actor.role === UserRole.PARENT) {
      scoped.parentId = actor.sub;
      scoped.type = InvoiceType.PARENT_INVOICE;
      recipientVisibleOnly = true;
    } else if (actor.role === UserRole.COACH) {
      scoped.coachId = actor.sub;
      scoped.type = InvoiceType.COACH_PAYOUT;
      recipientVisibleOnly = true;
    }
    return this.findAll(pagination, { ...scoped, recipientVisibleOnly });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: {
      type?: InvoiceType;
      parentId?: string;
      coachId?: string;
      status?: InvoiceStatus;
      pdfSent?: InvoicePdfSentFilter;
      sortBy?: InvoiceSortField;
      sortOrder?: 'asc' | 'desc';
      /** Only invoices whose PDF was sent at least once (admin Send). */
      recipientVisibleOnly?: boolean;
    }
  ) {
    const query: Record<string, unknown> = {};

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.parentId) {
      query.parentId = Types.ObjectId.isValid(filters.parentId)
        ? { $in: [filters.parentId, new Types.ObjectId(filters.parentId)] }
        : filters.parentId;
    }

    if (filters?.coachId) {
      query.coachId = Types.ObjectId.isValid(filters.coachId)
        ? { $in: [filters.coachId, new Types.ObjectId(filters.coachId)] }
        : filters.coachId;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    this.applyPdfSentFilter(query, filters?.pdfSent, filters?.recipientVisibleOnly);

    const skip = (pagination.page - 1) * pagination.limit;
    const sort = buildInvoiceSort(filters?.sortBy, filters?.sortOrder);

    const pipeline: any[] = [
      { $match: query },
      {
        $addFields: {
          originalParentId: '$parentId',
          originalCoachId: '$coachId',
          parentLookupId: {
            $convert: {
              input: '$parentId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
          coachLookupId: {
            $convert: {
              input: '$coachId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'parentLookupId',
          foreignField: '_id',
          as: 'parent',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'coachLookupId',
          foreignField: '_id',
          as: 'coach',
        },
      },
      { $unwind: { path: '$parent', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$coach', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          recipientSort: {
            $ifNull: [
              '$parent.parentProfile.name',
              {
                $ifNull: [
                  '$coach.coachProfile.name',
                  { $ifNull: ['$parent.email', '$coach.email'] },
                ],
              },
            ],
          },
        },
      },
      {
        $facet: {
          data: [
            { $sort: sort },
            { $skip: skip },
            { $limit: pagination.limit },
            {
              $addFields: {
                parentId: { $ifNull: ['$parent', '$originalParentId'] },
                coachId: { $ifNull: ['$coach', '$originalCoachId'] },
              },
            },
            {
              $project: {
                recipientSort: 0,
                parentLookupId: 0,
                coachLookupId: 0,
                originalParentId: 0,
                originalCoachId: 0,
                'parent.passwordHash': 0,
                'parent.googleCalendarRefreshToken': 0,
                'parent.__v': 0,
                'coach.passwordHash': 0,
                'coach.googleCalendarRefreshToken': 0,
                'coach.__v': 0,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.invoiceModel.aggregate(pipeline).exec();
    const data = result.data;
    const total = result.total[0]?.count || 0;

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

  async findByIdForActor(id: string, actor: JwtPayload) {
    const invoice = await this.findById(id);
    this.assertActorCanAccessInvoice(invoice, actor);
    if (
      (actor.role === UserRole.PARENT || actor.role === UserRole.COACH) &&
      invoice.pdfEmailedAt == null
    ) {
      throw new NotFoundException({
        errorCode: ErrorCode.INVOICE_NOT_FOUND,
        message: 'Invoice not found',
      });
    }
    return invoice;
  }

  private assertActorCanAccessInvoice(
    invoice: { type: InvoiceType; parentId?: string; coachId?: string },
    actor: JwtPayload
  ): void {
    if (actor.role === UserRole.ADMIN) {
      return;
    }
    if (actor.role === UserRole.PARENT) {
      if (invoice.type !== InvoiceType.PARENT_INVOICE || invoice.parentId !== actor.sub) {
        throw new ForbiddenException({
          errorCode: ErrorCode.FORBIDDEN,
          message: 'You cannot access this invoice',
        });
      }
      return;
    }
    if (actor.role === UserRole.COACH) {
      if (invoice.type !== InvoiceType.COACH_PAYOUT || invoice.coachId !== actor.sub) {
        throw new ForbiddenException({
          errorCode: ErrorCode.FORBIDDEN,
          message: 'You cannot access this invoice',
        });
      }
      return;
    }
    throw new ForbiddenException({
      errorCode: ErrorCode.FORBIDDEN,
      message: 'You cannot access this invoice',
    });
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
      pdfEmailedAt: inv.pdfEmailedAt,
      exportFields: inv.exportFields,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    };
  }

  /**
   * Notify parent or coach that the invoice PDF was delivered (first admin Send only).
   */
  async notifyRecipientsInvoiceDeliveredOnce(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceModel.findById(invoiceId).exec();
    if (!invoice) {
      return;
    }

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
  }

  /**
   * Records that the invoice PDF was emailed (updates timestamp on each successful send).
   */
  async markInvoicePdfEmailed(invoiceId: string): Promise<Date> {
    const at = new Date();
    const updated = await this.invoiceModel
      .findByIdAndUpdate(invoiceId, { $set: { pdfEmailedAt: at } }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException({
        errorCode: ErrorCode.INVOICE_NOT_FOUND,
        message: 'Invoice not found',
      });
    }
    return at;
  }

  async create(createInvoiceDto: CreateInvoiceDto, actorId: string) {
    const { kidName, ...invoicePayload } = createInvoiceDto;
    const totalAmount = invoicePayload.items.reduce((sum, item) => sum + item.amount, 0);

    const invoice = new this.invoiceModel({
      ...invoicePayload,
      ...(kidName ? { exportFields: { kidName } } : {}),
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

    return this.findById(invoice._id.toString());
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

    const invoiceWasSentToRecipient = invoice.pdfEmailedAt != null;

    if (
      invoiceWasSentToRecipient &&
      invoice.type === InvoiceType.PARENT_INVOICE &&
      invoice.parentId
    ) {
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

    if (invoiceWasSentToRecipient && invoice.type === InvoiceType.COACH_PAYOUT && invoice.coachId) {
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
    pdfSent?: InvoicePdfSentFilter;
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

    this.applyPdfSentFilter(query, filters?.pdfSent);

    const invoices = await this.invoiceModel
      .find(query)
      .populate('parentId')
      .populate('coachId')
      .exec();

    // Simple CSV generation
    const headers = [
      'ID',
      'Type',
      'Parent/Coach',
      'Total Amount',
      'Status',
      'Due Date',
      'Paid At',
      'PDF Emailed At',
    ];
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
      invoice.pdfEmailedAt?.toISOString() || 'N/A',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    return csv;
  }
}
