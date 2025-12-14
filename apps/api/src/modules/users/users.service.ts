import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import {
  CreateParentDto,
  UpdateParentDto,
  CreateCoachDto,
  UpdateCoachDto,
} from '@grow-fitness/shared-schemas';
import { AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    private authService: AuthService,
    private auditService: AuditService
  ) {}

  // Parents
  async findParents(pagination: PaginationDto, search?: string) {
    const query: Record<string, unknown> = { role: UserRole.PARENT };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'parentProfile.name': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(pagination.limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findParentById(id: string) {
    const parent = await this.userModel
      .findOne({ _id: id, role: UserRole.PARENT })
      .exec();

    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    const kids = await this.kidModel.find({ parentId: id }).exec();

    return {
      ...parent.toObject(),
      kids,
    };
  }

  async createParent(createParentDto: CreateParentDto, actorId: string) {
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

    const parent = new this.userModel({
      role: UserRole.PARENT,
      email: createParentDto.email.toLowerCase(),
      phone: createParentDto.phone,
      passwordHash,
      status: UserStatus.ACTIVE,
      parentProfile: {
        name: createParentDto.name,
        location: createParentDto.location,
      },
    });

    await parent.save();

    // Create kids
    const kids = await Promise.all(
      createParentDto.kids.map((kidData) => {
        const kid = new this.kidModel({
          ...kidData,
          parentId: parent._id,
          birthDate: new Date(kidData.birthDate),
        });
        return kid.save();
      })
    );

    await this.auditService.log({
      actorId,
      action: 'CREATE_PARENT',
      entityType: 'User',
      entityId: parent._id.toString(),
      metadata: { email: parent.email, kidsCount: kids.length },
    });

    return {
      ...parent.toObject(),
      kids,
    };
  }

  async updateParent(id: string, updateParentDto: UpdateParentDto, actorId: string) {
    const parent = await this.userModel
      .findOne({ _id: id, role: UserRole.PARENT })
      .exec();

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
    const parent = await this.userModel
      .findOne({ _id: id, role: UserRole.PARENT })
      .exec();

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
    const coach = await this.userModel
      .findOne({ _id: id, role: UserRole.COACH })
      .exec();

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
    const coach = await this.userModel
      .findOne({ _id: id, role: UserRole.COACH })
      .exec();

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
    const coach = await this.userModel
      .findOne({ _id: id, role: UserRole.COACH })
      .exec();

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

