import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { Session } from '../../infra/database/schemas/session.schema';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { GoogleCalendarSyncService } from '../google-calendar/google-calendar-sync.service';
import { SessionStatus, SessionType } from '@grow-fitness/shared-types';

function chainableFind(result: unknown[] = []) {
  const chain: any = {
    populate: jest.fn(() => chain),
    sort: jest.fn(() => chain),
    skip: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    lean: jest.fn(() => chain),
    exec: jest.fn().mockResolvedValue(result),
  };
  return chain;
}

describe('SessionsService', () => {
  let service: SessionsService;
  let findChain: any;

  beforeEach(async () => {
    findChain = chainableFind();
    const sessionModel = {
      find: jest.fn(() => findChain),
      countDocuments: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(0) })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: getModelToken(Session.name), useValue: sessionModel },
        { provide: getModelToken(Kid.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: NotificationService, useValue: { createNotification: jest.fn() } },
        { provide: GoogleCalendarSyncService, useValue: {} },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('sorts sessions before pagination', async () => {
    await service.findAll({ page: 3, limit: 20 } as any, {
      sortBy: 'duration',
      sortOrder: 'desc',
    });

    expect(findChain.sort).toHaveBeenCalledWith({ duration: -1, _id: 1 });
    expect(findChain.skip).toHaveBeenCalledWith(40);
    expect(findChain.limit).toHaveBeenCalledWith(20);
  });
});

describe('SessionsService urgent cancellation notifications', () => {
  function chainableFindById(result: unknown) {
    const chain: any = {
      populate: jest.fn(() => chain),
      lean: jest.fn(() => chain),
      exec: jest.fn().mockResolvedValue(result),
    };
    return chain;
  }

  function createService(initialStatus: SessionStatus) {
    const sessionDoc: any = {
      _id: 'session-1',
      title: 'Boxing Basics',
      type: SessionType.GROUP,
      coachId: 'coach-1',
      locationId: 'location-1',
      dateTime: new Date('2026-08-01T04:30:00Z'),
      duration: 60,
      capacity: 10,
      kids: ['kid-1', 'kid-2'],
      status: initialStatus,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const sessionModel = {
      findById: jest
        .fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(sessionDoc) })
        .mockReturnValueOnce(
          chainableFindById({
            ...sessionDoc,
            coachId: { _id: 'coach-1' },
            kids: ['kid-1', 'kid-2'],
          })
        )
        .mockReturnValue(chainableFindById({ ...sessionDoc, coachId: 'coach-1' })),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };
    const kidModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          { _id: 'kid-1', parentId: 'parent-1' },
          { _id: 'kid-2', parentId: 'parent-1' },
        ]),
      }),
    };
    const userModel = {
      findById: jest.fn((id: string) => ({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(
          id === 'coach-1'
            ? { email: 'coach@example.com', phone: '0722222222' }
            : { email: 'parent@example.com', phone: '0711111111' }
        ),
      })),
    };
    const notificationService = {
      createNotification: jest.fn().mockResolvedValue({}),
      sendSessionChange: jest.fn().mockResolvedValue(undefined),
      sendSessionDeleted: jest.fn().mockResolvedValue(undefined),
      sendUrgentSessionCancellation: jest.fn().mockResolvedValue(undefined),
    };
    const googleCalendarSync = {
      syncSessionUpdated: jest.fn().mockResolvedValue(undefined),
      syncSessionDeleted: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SessionsService(
      sessionModel as any,
      kidModel as any,
      userModel as any,
      { log: jest.fn().mockResolvedValue({}) } as any,
      notificationService as any,
      googleCalendarSync as any
    );
    return { service, sessionModel, notificationService };
  }

  it('sends generic updates and urgent email/SMS to coach and unique parents on cancellation transition', async () => {
    const { service, notificationService } = createService(SessionStatus.SCHEDULED);

    await service.update('session-1', { status: SessionStatus.CANCELLED } as any, 'admin-1');

    expect(notificationService.sendSessionChange).toHaveBeenCalledTimes(2);
    expect(notificationService.sendUrgentSessionCancellation).toHaveBeenCalledTimes(2);
    expect(notificationService.sendUrgentSessionCancellation).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'coach@example.com',
        phone: '0722222222',
        title: 'Boxing Basics',
      })
    );
    expect(notificationService.sendUrgentSessionCancellation).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'parent@example.com',
        phone: '0711111111',
        title: 'Boxing Basics',
      })
    );
  });

  it('does not send urgent cancellation alerts when editing an already cancelled session', async () => {
    const { service, notificationService } = createService(SessionStatus.CANCELLED);

    await service.update(
      'session-1',
      { dateTime: '2026-08-02T04:30:00Z' } as any,
      'admin-1'
    );

    expect(notificationService.sendSessionChange).toHaveBeenCalledTimes(2);
    expect(notificationService.sendUrgentSessionCancellation).not.toHaveBeenCalled();
  });

  it('does not send urgent cancellation alerts when deleting a session', async () => {
    const { service, sessionModel, notificationService } = createService(SessionStatus.SCHEDULED);
    const deletedSession = {
      _id: 'session-1',
      title: 'Boxing Basics',
      coachId: 'coach-1',
      kids: ['kid-1', 'kid-2'],
      dateTime: new Date('2026-08-01T04:30:00Z'),
    };
    sessionModel.findById = jest
      .fn()
      .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(deletedSession) })
      .mockReturnValueOnce(chainableFindById({
        ...deletedSession,
        locationId: { name: 'Main Studio' },
      }));

    await service.delete('session-1', 'admin-1');

    expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    expect(notificationService.sendUrgentSessionCancellation).not.toHaveBeenCalled();
  });
});
