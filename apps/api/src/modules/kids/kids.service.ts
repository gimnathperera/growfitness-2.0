import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { UpdateKidDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class KidsService {
  constructor(
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, parentId?: string, sessionType?: string) {
    const query: Record<string, unknown> = {};

    if (parentId) {
      query.parentId = parentId;
    }

    if (sessionType) {
      query.sessionType = sessionType;
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.kidModel
        .find(query)
        .populate('parentId', 'email parentProfile')
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.kidModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const kid = await this.kidModel.findById(id).populate('parentId').exec();

    if (!kid) {
      throw new NotFoundException({
        errorCode: ErrorCode.KID_NOT_FOUND,
        message: 'Kid not found',
      });
    }

    return kid;
  }

  async update(id: string, updateKidDto: UpdateKidDto, actorId: string) {
    const kid = await this.kidModel.findById(id).exec();

    if (!kid) {
      throw new NotFoundException({
        errorCode: ErrorCode.KID_NOT_FOUND,
        message: 'Kid not found',
      });
    }

    Object.assign(kid, {
      ...(updateKidDto.name && { name: updateKidDto.name }),
      ...(updateKidDto.gender && { gender: updateKidDto.gender }),
      ...(updateKidDto.birthDate && { birthDate: new Date(updateKidDto.birthDate) }),
      ...(updateKidDto.goal !== undefined && { goal: updateKidDto.goal }),
      ...(updateKidDto.currentlyInSports !== undefined && {
        currentlyInSports: updateKidDto.currentlyInSports,
      }),
      ...(updateKidDto.medicalConditions && { medicalConditions: updateKidDto.medicalConditions }),
      ...(updateKidDto.sessionType && { sessionType: updateKidDto.sessionType }),
    });

    await kid.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_KID',
      entityType: 'Kid',
      entityId: id,
      metadata: updateKidDto,
    });

    return kid;
  }

  async linkToParent(kidId: string, parentId: string, actorId: string) {
    const [kid, parent] = await Promise.all([
      this.kidModel.findById(kidId).exec(),
      this.userModel.findById(parentId).exec(),
    ]);

    if (!kid) {
      throw new NotFoundException({
        errorCode: ErrorCode.KID_NOT_FOUND,
        message: 'Kid not found',
      });
    }

    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    kid.parentId = parent._id;
    await kid.save();

    await this.auditService.log({
      actorId,
      action: 'LINK_KID_TO_PARENT',
      entityType: 'Kid',
      entityId: kidId,
      metadata: { parentId },
    });

    return kid;
  }

  async unlinkFromParent(kidId: string, actorId: string) {
    const kid = await this.kidModel.findById(kidId).exec();

    if (!kid) {
      throw new NotFoundException({
        errorCode: ErrorCode.KID_NOT_FOUND,
        message: 'Kid not found',
      });
    }

    kid.parentId = null as unknown as typeof kid.parentId;
    await kid.save();

    await this.auditService.log({
      actorId,
      action: 'UNLINK_KID_FROM_PARENT',
      entityType: 'Kid',
      entityId: kidId,
    });

    return kid;
  }
}

