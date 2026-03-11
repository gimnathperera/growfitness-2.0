import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from '../../infra/database/schemas/user.schema';
import { Kid } from '../../infra/database/schemas/kid.schema';
import { UserRegistrationRequest } from '../../infra/database/schemas/user-registration-request.schema';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockKidModel: any;
  let mockUserRegistrationRequestModel: any;
  let mockAuthService: any;
  let mockAuditService: any;
  let mockNotificationService: any;

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      countDocuments: jest.fn(),
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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
