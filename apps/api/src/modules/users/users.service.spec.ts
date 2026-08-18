import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from '../../infra/database/schemas/user.schema';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { UserRegistrationRequest } from '../../infra/database/schemas/user-registration-request.schema';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { UserCascadeService } from './user-cascade.service';
import { RequestStatus, UserRole, UserStatus } from '@grow-fitness/shared-types';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockKidModel: any;
  let mockUserRegistrationRequestModel: any;
  let mockAuthService: any;
  let mockAuditService: any;
  let mockNotificationService: any;
  let mockUserCascadeService: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ data: [], total: [{ count: 0 }] }]),
      }),
    };

    mockKidModel = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockUserRegistrationRequestModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockAuthService = {
      hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue({}),
    };

    mockNotificationService = {
      createNotification: jest.fn(),
      sendRegistrationApproved: jest.fn(),
    };

    mockUserCascadeService = {
      deleteParentHard: jest.fn(),
      deleteCoachHard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Kid.name),
          useValue: mockKidModel,
        },
        {
          provide: getModelToken(UserRegistrationRequest.name),
          useValue: mockUserRegistrationRequestModel,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: UserCascadeService,
          useValue: mockUserCascadeService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findParents', () => {
    it('does not hide unapproved parents when all statuses are requested', async () => {
      await service.findParents({ page: 1, limit: 10 } as any);

      const pipeline = mockUserModel.aggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({
        $match: {
          $and: [{ role: UserRole.PARENT }, { status: { $ne: UserStatus.DELETED } }],
        },
      });
      expect(JSON.stringify(pipeline[0])).not.toContain('isApproved');
    });

    it('applies active and inactive filters on top of the non-deleted parent base query', async () => {
      await service.findParents(
        { page: 1, limit: 10 } as any,
        undefined,
        undefined,
        UserStatus.INACTIVE
      );

      const pipeline = mockUserModel.aggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({
        $match: {
          $and: [
            { role: UserRole.PARENT },
            { status: { $ne: UserStatus.DELETED } },
            { status: UserStatus.INACTIVE },
          ],
        },
      });
      expect(JSON.stringify(pipeline[0])).not.toContain('isApproved');
    });

    it('sorts parents before pagination inside the data facet', async () => {
      await service.findParents(
        { page: 2, limit: 25 } as any,
        undefined,
        undefined,
        undefined,
        'name',
        'desc'
      );

      const pipeline = mockUserModel.aggregate.mock.calls[0][0];
      const dataFacet = pipeline.find((stage: any) => stage.$facet).$facet.data;
      expect(dataFacet).toEqual([
        { $sort: { 'parentProfile.name': -1, _id: 1 } },
        { $skip: 25 },
        { $limit: 25 },
      ]);
    });
  });
});

describe('UsersService parent registration notifications', () => {
  function createService() {
    const userModel: any = jest.fn().mockImplementation((data: any) => ({
      ...data,
      _id: 'parent-1',
      save: jest.fn().mockResolvedValue(undefined),
      toObject: jest.fn().mockReturnValue({ ...data, id: 'parent-1' }),
    }));
    userModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: 'admin-1' }]),
    });

    const kidModel: any = jest.fn().mockImplementation((data: any) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...data, _id: 'kid-1' }),
    }));

    const userRegistrationRequestModel: any = jest.fn().mockImplementation((data: any) => ({
      ...data,
      _id: 'registration-1',
      save: jest.fn().mockResolvedValue(undefined),
    }));

    const notificationService = {
      createNotification: jest.fn().mockResolvedValue({}),
      sendRegistrationReceived: jest.fn().mockResolvedValue(undefined),
    };

    const service = new UsersService(
      userModel,
      kidModel,
      userRegistrationRequestModel,
      { hashPassword: jest.fn().mockResolvedValue('hashed') } as any,
      { log: jest.fn().mockResolvedValue({}) } as any,
      notificationService as any,
      { deleteParentHard: jest.fn(), deleteCoachHard: jest.fn() } as any
    );

    return { service, userRegistrationRequestModel, notificationService };
  }

  const dto = {
    email: 'parent@example.com',
    phone: '0711111111',
    password: 'password',
    name: 'Parent One',
    location: 'Colombo',
    kids: [
      {
        name: 'Kid One',
        gender: 'Male',
        birthDate: '2020-01-01',
        currentlyInSports: false,
        medicalConditions: [],
        sessionType: 'INDIVIDUAL',
      },
    ],
  };

  it('sends a received-confirmation email once for public parent registrations', async () => {
    const { service, userRegistrationRequestModel, notificationService } = createService();

    await service.createParent(dto as any, null);

    expect(userRegistrationRequestModel).toHaveBeenCalledWith({
      parentId: 'parent-1',
      status: RequestStatus.PENDING,
    });
    expect(notificationService.sendRegistrationReceived).toHaveBeenCalledTimes(1);
    expect(notificationService.sendRegistrationReceived).toHaveBeenCalledWith({
      email: 'parent@example.com',
      parentName: 'Parent One',
    });
    expect(notificationService.createNotification).toHaveBeenCalledTimes(1);
  });

  it('does not send received-confirmation email when an admin creates a parent', async () => {
    const { service, userRegistrationRequestModel, notificationService } = createService();

    await service.createParent(dto as any, 'admin-1');

    expect(userRegistrationRequestModel).not.toHaveBeenCalled();
    expect(notificationService.sendRegistrationReceived).not.toHaveBeenCalled();
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });
});
