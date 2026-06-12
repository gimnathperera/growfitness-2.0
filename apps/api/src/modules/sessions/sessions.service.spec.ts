import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { Session } from '../../infra/database/schemas/session.schema';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { User } from '../../infra/database/schemas/user.schema';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { GoogleCalendarSyncService } from '../google-calendar/google-calendar-sync.service';

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
