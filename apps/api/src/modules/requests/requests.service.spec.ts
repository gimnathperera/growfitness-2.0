import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RequestsService } from './requests.service';
import { FreeSessionRequest } from '../../infra/database/schemas/free-session-request.schema';
import { RescheduleRequest } from '../../infra/database/schemas/reschedule-request.schema';
import { ExtraSessionRequest } from '../../infra/database/schemas/extra-session-request.schema';
import { UserRegistrationRequest } from '../../infra/database/schemas/user-registration-request.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { Session } from '../../infra/database/schemas/session.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { SessionsService } from '../sessions/sessions.service';
import { RequestStatus } from '@grow-fitness/shared-types';

function chainableFind(result: unknown[] = []) {
  const chain: any = {
    populate: jest.fn(() => chain),
    sort: jest.fn(() => chain),
    skip: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    exec: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

describe('RequestsService list sorting', () => {
  let service: RequestsService;
  let freeFindChain: any;
  let rescheduleFindChain: any;
  let extraModel: any;
  let userRegistrationModel: any;

  beforeEach(async () => {
    freeFindChain = chainableFind();
    rescheduleFindChain = chainableFind();
    extraModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };
    userRegistrationModel = {
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getModelToken(FreeSessionRequest.name),
          useValue: {
            find: jest.fn(() => freeFindChain),
            countDocuments: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(0) })),
          },
        },
        {
          provide: getModelToken(RescheduleRequest.name),
          useValue: {
            find: jest.fn(() => rescheduleFindChain),
            countDocuments: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(0) })),
          },
        },
        { provide: getModelToken(ExtraSessionRequest.name), useValue: extraModel },
        { provide: getModelToken(UserRegistrationRequest.name), useValue: userRegistrationModel },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: getModelToken(Kid.name), useValue: {} },
        { provide: getModelToken(Session.name), useValue: {} },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { createNotification: jest.fn() } },
        { provide: SessionsService, useValue: {} },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('sorts free-session requests before pagination', async () => {
    await service.findFreeSessionRequests({ page: 2, limit: 10 } as any, 'kidName', 'asc');

    expect(freeFindChain.sort).toHaveBeenCalledWith({ kidName: 1, _id: 1 });
    expect(freeFindChain.skip).toHaveBeenCalledWith(10);
  });

  it('sorts reschedule requests before pagination', async () => {
    await service.findRescheduleRequests({ page: 2, limit: 10 } as any, 'newDateTime', 'desc');

    expect(rescheduleFindChain.sort).toHaveBeenCalledWith({ newDateTime: -1, _id: 1 });
    expect(rescheduleFindChain.skip).toHaveBeenCalledWith(10);
  });

  it('sorts extra-session requests by populated kid name before pagination', async () => {
    await service.findExtraSessionRequests({ page: 3, limit: 5 } as any, 'kid', 'asc');

    const pipeline = extraModel.aggregate.mock.calls[0][0];
    const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;

    expect(dataFacet.slice(0, 3)).toEqual([
      { $sort: { 'kid.name': 1, _id: 1 } },
      { $skip: 10 },
      { $limit: 5 },
    ]);
  });

  it('sorts user-registration requests by populated parent name before pagination', async () => {
    await service.findUserRegistrationRequests({ page: 3, limit: 5 } as any, 'parent', 'desc');

    const pipeline = userRegistrationModel.aggregate.mock.calls[0][0];
    const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;

    expect(dataFacet.slice(0, 3)).toEqual([
      { $sort: { 'parent.parentProfile.name': -1, _id: 1 } },
      { $skip: 10 },
      { $limit: 5 },
    ]);
  });
});

describe('RequestsService registration rejection notifications', () => {
  function createService(requestStatus: RequestStatus) {
    const request = {
      _id: 'registration-1',
      parentId: 'parent-1',
      status: requestStatus,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const userRegistrationModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(request) }),
    };
    const parent = {
      _id: 'parent-1',
      email: 'parent@example.com',
      phone: '0711111111',
      parentProfile: { name: 'Parent One' },
      status: undefined,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const userModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(parent) }),
    };
    const kidModel = {
      find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: 'kid-1' }]) }),
    };
    const notificationService = {
      createNotification: jest.fn().mockResolvedValue({}),
      sendRegistrationRejected: jest.fn().mockResolvedValue(undefined),
    };

    const service = new RequestsService(
      {} as any,
      {} as any,
      {} as any,
      userRegistrationModel as any,
      userModel as any,
      kidModel as any,
      {} as any,
      { log: jest.fn().mockResolvedValue({}) } as any,
      notificationService as any,
      {} as any
    );

    return { service, request, notificationService };
  }

  it('sends in-app and email when a registration transitions to denied', async () => {
    const { service, request, notificationService } = createService(RequestStatus.PENDING);

    await service.rejectUserRegistrationRequest('registration-1', '507f1f77bcf86cd799439011');

    expect(request.status).toBe(RequestStatus.DENIED);
    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
    expect(notificationService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'parent-1',
        type: 'REGISTRATION_REJECTED',
        title: 'Registration not approved',
        entityType: 'UserRegistrationRequest',
        entityId: 'registration-1',
      })
    );
    expect(notificationService.sendRegistrationRejected).toHaveBeenCalledTimes(1);
    expect(notificationService.sendRegistrationRejected).toHaveBeenCalledWith({
      email: 'parent@example.com',
      phone: '0711111111',
      parentName: 'Parent One',
    });
  });

  it('does not resend rejection notifications when already denied', async () => {
    const { service, notificationService } = createService(RequestStatus.DENIED);

    await service.rejectUserRegistrationRequest('registration-1', '507f1f77bcf86cd799439011');

    expect(notificationService.createNotification).not.toHaveBeenCalled();
    expect(notificationService.sendRegistrationRejected).not.toHaveBeenCalled();
  });
});
