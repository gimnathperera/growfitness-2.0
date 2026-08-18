import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { KidsService } from './kids.service';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';
import { SessionType } from '@grow-fitness/shared-types';

describe('KidsService', () => {
  let service: KidsService;
  let mockKidModel: any;

  beforeEach(async () => {
    mockKidModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KidsService,
        {
          provide: getModelToken(Kid.name),
          useValue: mockKidModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: {},
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<KidsService>(KidsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('does not hide unapproved kids from the admin list count', async () => {
      await service.findAll({ page: 1, limit: 10 } as any);

      const pipeline = mockKidModel.aggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({ $match: {} });
      expect(JSON.stringify(pipeline[0])).not.toContain('isApproved');
    });

    it('applies filters before count and pagination', async () => {
      await service.findAll(
        { page: 1, limit: 10 } as any,
        undefined,
        SessionType.GROUP,
        'strength',
        { gender: 'Female' }
      );

      const pipeline = mockKidModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match).toMatchObject({
        sessionType: SessionType.GROUP,
        gender: 'Female',
      });
      const searchMatch = pipeline.find((stage: any) => stage.$match?.$or);
      expect(searchMatch.$match.$or).toHaveLength(9);

      const facet = pipeline.find((stage: any) => stage.$facet).$facet;
      expect(facet.total).toEqual([{ $count: 'count' }]);
    });

    it('sorts by parent name before pagination', async () => {
      await service.findAll(
        { page: 2, limit: 5 } as any,
        undefined,
        undefined,
        undefined,
        {},
        'parentName',
        'desc'
      );

      const pipeline = mockKidModel.aggregate.mock.calls[0][0];
      const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;
      expect(dataFacet).toEqual([
        { $sort: { 'parent.parentProfile.name': -1, _id: 1 } },
        { $skip: 5 },
        { $limit: 5 },
      ]);
    });
  });
});
