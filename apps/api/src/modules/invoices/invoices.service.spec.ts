import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { Invoice } from '../../infra/database/schemas/invoice.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { InvoiceStatus, InvoiceType, NotificationType, UserRole } from '@grow-fitness/shared-types';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceModel: any;
  let userModel: any;
  let notificationService: any;
  let auditService: any;

  beforeEach(async () => {
    invoiceModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };
    userModel = {};
    notificationService = {
      createNotification: jest.fn().mockResolvedValue({}),
      sendNewInvoiceSmsToParent: jest.fn().mockResolvedValue(undefined),
      sendInvoiceUpdate: jest.fn().mockResolvedValue(undefined),
      sendPaymentReceiptToParent: jest.fn().mockResolvedValue(undefined),
      sendAdminPaymentReceived: jest.fn().mockResolvedValue(undefined),
      sendCoachPayoutPaid: jest.fn().mockResolvedValue(undefined),
    };
    auditService = { log: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: AuditService, useValue: auditService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('sorts invoices by recipient before pagination', async () => {
    await service.findAllForActor(
      { page: 2, limit: 15 } as any,
      { sortBy: 'recipient', sortOrder: 'asc' },
      { sub: 'admin-id', role: UserRole.ADMIN, email: 'admin@example.com' } as any
    );

    const pipeline = invoiceModel.aggregate.mock.calls[0][0];
    expect(pipeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          $addFields: expect.objectContaining({
            parentLookupId: expect.objectContaining({
              $convert: expect.objectContaining({ input: '$parentId', to: 'objectId' }),
            }),
            coachLookupId: expect.objectContaining({
              $convert: expect.objectContaining({ input: '$coachId', to: 'objectId' }),
            }),
          }),
        }),
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'parentLookupId',
          }),
        }),
        expect.objectContaining({
          $lookup: expect.objectContaining({
            from: 'users',
            localField: 'coachLookupId',
          }),
        }),
      ])
    );

    const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;

    expect(dataFacet.slice(0, 3)).toEqual([
      { $sort: { recipientSort: 1, _id: 1 } },
      { $skip: 15 },
      { $limit: 15 },
    ]);
    expect(dataFacet[3]).toEqual({
      $addFields: {
        parentId: { $ifNull: ['$parent', '$originalParentId'] },
        coachId: { $ifNull: ['$coach', '$originalCoachId'] },
      },
    });
    expect(dataFacet[4].$project.parentId).toBeUndefined();
    expect(dataFacet[4].$project.coachId).toBeUndefined();
  });

  it('defaults to nearest due date before pagination', async () => {
    await service.findAllForActor(
      { page: 1, limit: 10 } as any,
      {},
      { sub: 'admin-id', role: UserRole.ADMIN, email: 'admin@example.com' } as any
    );

    const pipeline = invoiceModel.aggregate.mock.calls[0][0];
    const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;

    expect(dataFacet.slice(0, 3)).toEqual([
      { $sort: { dueDate: 1, _id: 1 } },
      { $skip: 0 },
      { $limit: 10 },
    ]);
  });

  it('sends exactly one in-app and one SMS alert after the first parent invoice PDF delivery', async () => {
    invoiceModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: 'invoice-1',
        type: InvoiceType.PARENT_INVOICE,
        parentId: 'parent-1',
        totalAmount: 4500,
        dueDate: new Date('2026-08-31T00:00:00Z'),
      }),
    });
    userModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        email: 'parent@example.com',
        phone: '0711111111',
        parentProfile: { name: 'Parent One' },
      }),
    });

    await service.notifyRecipientsInvoiceDeliveredOnce('invoice-1');

    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'parent-1',
        type: NotificationType.INVOICE_CREATED,
        title: 'New invoice',
        entityType: 'Invoice',
        entityId: 'invoice-1',
      })
    );
    expect(notificationService.sendNewInvoiceSmsToParent).toHaveBeenCalledTimes(1);
    expect(notificationService.sendNewInvoiceSmsToParent).toHaveBeenCalledWith({
      phone: '0711111111',
      recipientName: 'Parent One',
      invoiceId: 'invoice-1',
      amount: 4500,
      dueDate: new Date('2026-08-31T00:00:00Z'),
    });
  });

  it('sends parent generic, parent receipt, and admin payment received notifications on parent paid transition', async () => {
    const invoice = {
      _id: 'invoice-2',
      type: InvoiceType.PARENT_INVOICE,
      parentId: 'parent-2',
      status: InvoiceStatus.PENDING,
      totalAmount: 12500,
      pdfEmailedAt: new Date('2026-07-01T10:00:00Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    invoiceModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(invoice) })
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice),
      });
    userModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        email: 'parent@example.com',
        phone: '0711111111',
        parentProfile: { name: 'Parent Two' },
      }),
    });
    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: 'admin-1', email: 'admin@example.com' }]),
    });

    await service.updatePaymentStatus(
      'invoice-2',
      { status: InvoiceStatus.PAID, paidAt: '2026-07-02T10:00:00Z' } as any,
      'actor-1'
    );

    expect(notificationService.sendInvoiceUpdate).toHaveBeenCalledTimes(1);
    expect(notificationService.sendPaymentReceiptToParent).toHaveBeenCalledTimes(1);
    expect(notificationService.sendAdminPaymentReceived).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'parent-2',
        type: NotificationType.INVOICE_STATUS_UPDATED,
      })
    );
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        type: NotificationType.PAYMENT_RECEIVED,
        title: 'Payment Received',
        entityType: 'Invoice',
        entityId: 'invoice-2',
      })
    );
  });

  it('does not resend paid-transition notifications when an invoice is already paid', async () => {
    const invoice = {
      _id: 'invoice-3',
      type: InvoiceType.PARENT_INVOICE,
      parentId: 'parent-3',
      status: InvoiceStatus.PAID,
      totalAmount: 1000,
      pdfEmailedAt: new Date('2026-07-01T10:00:00Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    invoiceModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(invoice) })
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice),
      });

    await service.updatePaymentStatus(
      'invoice-3',
      { status: InvoiceStatus.PAID, paidAt: '2026-07-02T10:00:00Z' } as any,
      'actor-1'
    );

    expect(notificationService.sendInvoiceUpdate).not.toHaveBeenCalled();
    expect(notificationService.sendPaymentReceiptToParent).not.toHaveBeenCalled();
    expect(notificationService.sendAdminPaymentReceived).not.toHaveBeenCalled();
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });

  it('sends paid-transition notifications for parent invoices even when the PDF was not sent', async () => {
    const invoice = {
      _id: 'invoice-unsent-paid',
      type: InvoiceType.PARENT_INVOICE,
      parentId: 'parent-unsent',
      status: InvoiceStatus.PENDING,
      totalAmount: 2500,
      pdfEmailedAt: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };
    invoiceModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(invoice) })
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice),
      });
    userModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        email: 'parent@example.com',
        phone: '0711111111',
        parentProfile: { name: 'Parent Unsent' },
      }),
    });
    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: 'admin-1', email: 'admin@example.com' }]),
    });

    await service.updatePaymentStatus(
      'invoice-unsent-paid',
      { status: InvoiceStatus.PAID } as any,
      'actor-1'
    );

    expect(notificationService.sendInvoiceUpdate).not.toHaveBeenCalled();
    expect(notificationService.sendPaymentReceiptToParent).toHaveBeenCalledTimes(1);
    expect(notificationService.sendAdminPaymentReceived).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        type: NotificationType.PAYMENT_RECEIVED,
      })
    );
  });

  it('sends coach payout processed only on paid transition', async () => {
    const invoice = {
      _id: 'invoice-4',
      type: InvoiceType.COACH_PAYOUT,
      coachId: 'coach-1',
      status: InvoiceStatus.PENDING,
      pdfEmailedAt: new Date('2026-07-01T10:00:00Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    invoiceModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(invoice) })
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice),
      });
    userModel.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        email: 'coach@example.com',
        phone: '0722222222',
        coachProfile: { name: 'Coach One' },
      }),
    });

    await service.updatePaymentStatus('invoice-4', { status: InvoiceStatus.PAID } as any, 'actor-1');

    expect(notificationService.sendInvoiceUpdate).not.toHaveBeenCalled();
    expect(notificationService.sendCoachPayoutPaid).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'coach-1',
        title: 'Payment Processed',
        body: 'Hello Coach One, your monthly payment has been processed.',
      })
    );
  });

  it('does not send generic coach payout notifications for non-paid status changes', async () => {
    const invoice = {
      _id: 'invoice-5',
      type: InvoiceType.COACH_PAYOUT,
      coachId: 'coach-1',
      status: InvoiceStatus.PENDING,
      pdfEmailedAt: new Date('2026-07-01T10:00:00Z'),
      save: jest.fn().mockResolvedValue(undefined),
    };
    invoiceModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(invoice) })
      .mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(invoice),
      });

    await service.updatePaymentStatus(
      'invoice-5',
      { status: InvoiceStatus.OVERDUE } as any,
      'actor-1'
    );

    expect(notificationService.sendCoachPayoutPaid).not.toHaveBeenCalled();
    expect(notificationService.sendInvoiceUpdate).not.toHaveBeenCalled();
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });
});
