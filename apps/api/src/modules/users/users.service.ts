import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import {
  UserRegistrationRequest,
  UserRegistrationRequestDocument,
} from '../../infra/database/schemas/user-registration-request.schema';
import { UserRole, UserStatus, RequestStatus } from '@grow-fitness/shared-types';
import { NotificationType } from '@grow-fitness/shared-types';
import {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(UserRegistrationRequest.name)
    private userRegistrationRequestModel: Model<UserRegistrationRequestDocument>,
    private authService: AuthService,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  // Parents
  async findParents(
    pagination: PaginationDto,
    search?: string,
    location?: string,
    status?: UserStatus
  ) {
    const query: Record<string, unknown> = { role: UserRole.PARENT };

    if (status) {
      query.status = status;
    } else {
      // Default behavior: only show approved parents
      query.isApproved = true;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'parentProfile.name': { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query['parentProfile.location'] = { $regex: location, $options: 'i' };
    }

    const skip = (pagination.page - 1) * pagination.limit;

    const pipeline: any[] = [
      { $match: query },
      // Lookup kids to get their IDs and default session types
      {
        $lookup: {
          from: 'kids',
          localField: '_id',
          foreignField: 'parentId',
          as: 'kidsData',
        },
      },
      // Lookup sessions where these kids are enrolled
      {
        $lookup: {
          from: 'sessions',
          let: { kidIds: '$kidsData._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gt: [{ $size: { $setIntersection: ['$kids', '$$kidIds'] } }, 0] },
                    { $ne: ['$status', 'CANCELLED'] }, // Only count non-cancelled sessions
                  ],
                },
              },
            },
            { $project: { type: 1 } },
          ],
          as: 'matchedSessions',
        },
      },
      {
        $addFields: {
          sessionTypes: {
            $setUnion: [
              { $ifNull: ['$kidsData.sessionType', []] },
              { $ifNull: ['$matchedSessions.type', []] },
            ],
          },
        },
      },
      {
        $project: {
          kidsData: 0,
          matchedSessions: 0,
          passwordHash: 0,
        },
      },
      {
        $facet: {
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pagination.limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.userModel.aggregate(pipeline).exec();
    const data = result.data;
    const total = result.total[0]?.count || 0;

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findParentById(id: string, includeUnapproved: boolean = false) {
    const query: Record<string, unknown> = { _id: id, role: UserRole.PARENT };
    if (!includeUnapproved) {
      query.isApproved = true;
    }

    const parent = await this.userModel.findOne(query).exec();

    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    // Convert string id to ObjectId for querying kids
    const kidsQuery: Record<string, unknown> = { parentId: new Types.ObjectId(id) };
    if (!includeUnapproved) {
      kidsQuery.isApproved = true;
    }
    const kids = await this.kidModel.find(kidsQuery).exec();

    return {
      ...parent.toObject(),
      kids,
    };
  }

  async createParent(createParentDto: CreateParentDto, actorId: string | null) {
    // Check if email already exists
    const existingUser = await this.userModel
      .findOne({ email: createParentDto.email.toLowerCase() })
      .exec();

    if (existingUser) {
      throw new ConflictException({
        errorCode: ErrorCode.DUPLICATE_EMAIL,
        message: 'Email already exists',
      });
    }

    const passwordHash = await this.authService.hashPassword(createParentDto.password);

    // If actorId is provided, it's an admin creation - auto-approve
    // If actorId is null, it's a public registration - requires approval
    const isApproved = actorId !== null;

    const parent = new this.userModel({
      role: UserRole.PARENT,
      email: createParentDto.email.toLowerCase(),
      phone: createParentDto.phone,
      passwordHash,
      status: UserStatus.ACTIVE,
      isApproved,
      parentProfile: {
        name: createParentDto.name,
        location: createParentDto.location,
      },
    });

    await parent.save();

    // Create kids
    const kids = await Promise.all(
      createParentDto.kids.map(kidData => {
        const kid = new this.kidModel({
          ...kidData,
          parentId: parent._id,
          birthDate: new Date(kidData.birthDate),
          isApproved, // Same approval status as parent
        });
        return kid.save();
      })
    );

    // Only create user registration request for public registrations (when actorId is null)
    if (!isApproved) {
      const registrationRequest = new this.userRegistrationRequestModel({
        parentId: parent._id,
        status: RequestStatus.PENDING,
      });
      await registrationRequest.save();
      const admins = await this.userModel
        .find({ role: UserRole.ADMIN })
        .select('_id')
        .lean()
        .exec();
      const requestId = registrationRequest._id.toString();
      const parentName = parent.parentProfile?.name ?? parent.email;
      for (const a of admins) {
        const adminId = (a as any)._id?.toString?.();
        if (adminId) {
          await this.notificationService.createNotification({
            userId: adminId,
            type: NotificationType.USER_REGISTRATION_REQUEST,
            title: 'New user registration request',
            body: `${parentName} has requested to join.`,
            entityType: 'UserRegistrationRequest',
            entityId: requestId,
          });
        }
      }
    }

    // Log audit if actorId is provided (admin creation)
    if (actorId) {
      await this.auditService.log({
        actorId,
        action: 'CREATE_PARENT',
        entityType: 'User',
        entityId: parent._id.toString(),
        metadata: { email: parent.email, kidsCount: kids.length },
      });
    }

    return {
      ...parent.toObject(),
      kids,
    };
  }

  async updateParent(id: string, updateParentDto: UpdateParentDto, actorId: string) {
    const parent = await this.userModel.findOne({ _id: id, role: UserRole.PARENT }).exec();

    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    if (updateParentDto.email && updateParentDto.email !== parent.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateParentDto.email.toLowerCase() })
        .exec();

      if (existingUser) {
        throw new ConflictException({
          errorCode: ErrorCode.DUPLICATE_EMAIL,
          message: 'Email already exists',
        });
      }
    }

    Object.assign(parent, {
      ...(updateParentDto.email && { email: updateParentDto.email.toLowerCase() }),
      ...(updateParentDto.phone && { phone: updateParentDto.phone }),
      ...(updateParentDto.status && { status: updateParentDto.status }),
      ...(updateParentDto.name && {
        parentProfile: {
          ...parent.parentProfile,
          name: updateParentDto.name,
          location: updateParentDto.location || parent.parentProfile?.location,
        },
      }),
    });

    await parent.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_PARENT',
      entityType: 'User',
      entityId: id,
      metadata: updateParentDto,
    });

    return parent;
  }

  async deleteParent(id: string, actorId: string) {
    const parent = await this.userModel.findOne({ _id: id, role: UserRole.PARENT }).exec();

    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    parent.status = UserStatus.DELETED;
    await parent.save();

    await this.auditService.log({
      actorId,
      action: 'DELETE_PARENT',
      entityType: 'User',
      entityId: id,
    });

    return { message: 'Parent deleted successfully' };
  }

  // Coaches
  async findCoaches(pagination: PaginationDto, search?: string) {
    const query: Record<string, unknown> = { role: UserRole.COACH };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'coachProfile.name': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(pagination.limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findCoachById(id: string) {
    const coach = await this.userModel.findOne({ _id: id, role: UserRole.COACH }).exec();

    if (!coach) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Coach not found',
      });
    }

    return coach;
  }

  async createCoach(createCoachDto: CreateCoachDto, actorId: string) {
    const existingUser = await this.userModel
      .findOne({ email: createCoachDto.email.toLowerCase() })
      .exec();

    if (existingUser) {
      throw new ConflictException({
        errorCode: ErrorCode.DUPLICATE_EMAIL,
        message: 'Email already exists',
      });
    }

    const passwordHash = await this.authService.hashPassword(createCoachDto.password);

    const coach = new this.userModel({
      role: UserRole.COACH,
      email: createCoachDto.email.toLowerCase(),
      phone: createCoachDto.phone,
      passwordHash,
      status: UserStatus.ACTIVE,
      isApproved: true, // Coaches created by admins are automatically approved
      coachProfile: {
        name: createCoachDto.name,
      },
    });

    await coach.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_COACH',
      entityType: 'User',
      entityId: coach._id.toString(),
      metadata: { email: coach.email },
    });

    return coach;
  }

  async updateCoach(id: string, updateCoachDto: UpdateCoachDto, actorId: string) {
    const coach = await this.userModel.findOne({ _id: id, role: UserRole.COACH }).exec();

    if (!coach) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Coach not found',
      });
    }

    if (updateCoachDto.email && updateCoachDto.email !== coach.email) {
      const existingUser = await this.userModel
        .findOne({ email: updateCoachDto.email.toLowerCase() })
        .exec();

      if (existingUser) {
        throw new ConflictException({
          errorCode: ErrorCode.DUPLICATE_EMAIL,
          message: 'Email already exists',
        });
      }
    }

    Object.assign(coach, {
      ...(updateCoachDto.email && { email: updateCoachDto.email.toLowerCase() }),
      ...(updateCoachDto.phone && { phone: updateCoachDto.phone }),
      ...(updateCoachDto.status && { status: updateCoachDto.status }),
      ...(updateCoachDto.name && {
        coachProfile: {
          ...coach.coachProfile,
          name: updateCoachDto.name,
        },
      }),
    });

    await coach.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_COACH',
      entityType: 'User',
      entityId: id,
      metadata: updateCoachDto,
    });

    return coach;
  }

  async deactivateCoach(id: string, actorId: string) {
    const coach = await this.userModel.findOne({ _id: id, role: UserRole.COACH }).exec();

    if (!coach) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Coach not found',
      });
    }

    coach.status = UserStatus.INACTIVE;
    await coach.save();

    await this.auditService.log({
      actorId,
      action: 'DEACTIVATE_COACH',
      entityType: 'User',
      entityId: id,
    });

    return { message: 'Coach deactivated successfully' };
  }
}
