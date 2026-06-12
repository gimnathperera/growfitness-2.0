import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { Invoice } from '../../infra/database/schemas/invoice.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { UserRole } from '@grow-fitness/shared-types';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceModel: any;

  beforeEach(async () => {
    invoiceModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { createNotification: jest.fn() } },
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
});
