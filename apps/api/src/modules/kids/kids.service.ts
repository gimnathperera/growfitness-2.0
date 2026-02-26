import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { CreateKidDto, UpdateKidDto } from '@grow-fitness/shared-schemas';
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

  async findAll(
    pagination: PaginationDto,
    parentId?: string,
    sessionType?: string,
    search?: string
  ) {
    const query: Record<string, unknown> = { isApproved: true };

    if (parentId) {
      query.parentId = new Types.ObjectId(parentId);
    }

    if (sessionType) {
      query.sessionType = sessionType;
    }

    // Add search functionality - search by name or goal
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { goal: searchRegex }];
    }

    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.kidModel
        .find(query)
        .populate('parentId', 'email parentProfile coachProfile')
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      this.kidModel.countDocuments(query).exec(),
    ]);

    // Transform parentId to parent in the response
    const transformedData = data.map((kid: any) => {
      const { parentId, ...rest } = kid;
      return {
        ...rest,
        parent: parentId || undefined,
      };
    });

    return new PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const kid = await this.kidModel
      .findOne({ _id: id, isApproved: true })
      .populate('parentId', 'email parentProfile coachProfile')
      .lean()
      .exec();

    if (!kid) {
      throw new NotFoundException({
        errorCode: ErrorCode.KID_NOT_FOUND,
        message: 'Kid not found',
      });
    }

    // Transform parentId to parent in the response
    const { parentId, ...rest } = kid as any;
    return {
      ...rest,
      parent: parentId || undefined,
    };
  }

  async create(createKidDto: CreateKidDto, actorId: string) {
    // Verify parent exists
    const parent = await this.userModel.findById(createKidDto.parentId).exec();
    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    // Kids created by admin are automatically approved
    // If parent is approved, kid should also be approved
    // If parent is not approved, kid should also not be approved
    const isApproved = (parent as any).isApproved !== false;

    const kid = new this.kidModel({
      ...createKidDto,
      parentId: parent._id,
      birthDate: new Date(createKidDto.birthDate),
      medicalConditions: createKidDto.medicalConditions || [],
      isApproved,
    });

    await kid.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_KID',
      entityType: 'Kid',
      entityId: kid._id.toString(),
      metadata: { name: kid.name, parentId: parent._id.toString() },
    });

    // Fetch created kid with populated parent and transform
    const createdKid = await this.kidModel
      .findById(kid._id)
      .populate('parentId', 'email parentProfile coachProfile')
      .lean()
      .exec();

    if (!createdKid) {
      return kid;
    }

    const { parentId, ...rest } = createdKid as any;
    return {
      ...rest,
      parent: parentId || undefined,
    };
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

    // Fetch updated kid with populated parent and transform
    const updatedKid = await this.kidModel
      .findById(id)
      .populate('parentId', 'email parentProfile coachProfile')
      .lean()
      .exec();
    if (!updatedKid) {
      return kid;
    }

    const { parentId, ...rest } = updatedKid as any;
    return {
      ...rest,
      parent: parentId || undefined,
    };
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

    // Fetch updated kid with populated parent and transform
    const updatedKid = await this.kidModel
      .findById(kidId)
      .populate('parentId', 'email parentProfile coachProfile')
      .lean()
      .exec();
    if (!updatedKid) {
      return kid;
    }

    const { parentId: updatedParentId, ...rest } = updatedKid as any;
    return {
      ...rest,
      parent: updatedParentId || undefined,
    };
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

    // Fetch updated kid and transform
    const updatedKid = await this.kidModel.findById(kidId).lean().exec();
    if (!updatedKid) {
      return kid;
    }

    const { parentId, ...rest } = updatedKid as any;
    return {
      ...rest,
      parent: undefined,
    };
  }
}
