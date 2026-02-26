import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FreeSessionRequest,
  FreeSessionRequestDocument,
} from '../../infra/database/schemas/free-session-request.schema';
import {
  RescheduleRequest,
  RescheduleRequestDocument,
} from '../../infra/database/schemas/reschedule-request.schema';
import {
  ExtraSessionRequest,
  ExtraSessionRequestDocument,
} from '../../infra/database/schemas/extra-session-request.schema';
import {
  CreateFreeSessionRequestDto,
  CreateRescheduleRequestDto,
  CreateExtraSessionRequestDto,
} from '@grow-fitness/shared-schemas';
import {
  UserRegistrationRequest,
  UserRegistrationRequestDocument,
} from '../../infra/database/schemas/user-registration-request.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { Session, SessionDocument } from '../../infra/database/schemas/session.schema';
import { RequestStatus, UserStatus, UserRole, NotificationType } from '@grow-fitness/shared-types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { Types } from 'mongoose';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(FreeSessionRequest.name)
    private freeSessionRequestModel: Model<FreeSessionRequestDocument>,
    @InjectModel(RescheduleRequest.name)
    private rescheduleRequestModel: Model<RescheduleRequestDocument>,
    @InjectModel(ExtraSessionRequest.name)
    private extraSessionRequestModel: Model<ExtraSessionRequestDocument>,
    @InjectModel(UserRegistrationRequest.name)
    private userRegistrationRequestModel: Model<UserRegistrationRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Kid.name) private kidModel: Model<KidDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  private async notifyAdmins(
    type: NotificationType,
    title: string,
    body: string,
    entityType?: string,
    entityId?: string
  ): Promise<void> {
    const admins = await this.userModel.find({ role: UserRole.ADMIN }).select('_id').lean().exec();
    for (const a of admins) {
      const id = (a as any)._id?.toString?.();
      if (id) {
        await this.notificationService.createNotification({
          userId: id,
          type,
          title,
          body,
          entityType,
          entityId,
        });
      }
    }
  }

  // Free Session Requests
  async createFreeSessionRequest(data: CreateFreeSessionRequestDto): Promise<FreeSessionRequest> {
    const request = new this.freeSessionRequestModel({
      ...data,
      selectedSessionId: data.selectedSessionId
        ? new Types.ObjectId(data.selectedSessionId)
        : undefined,
      locationId: new Types.ObjectId(data.locationId),
      preferredDateTime: new Date(data.preferredDateTime),
      status: RequestStatus.PENDING,
    });
    const saved = await request.save();
    await this.notifyAdmins(
      NotificationType.FREE_SESSION_REQUEST,
      'New free session request',
      `${data.parentName} requested a free session for ${data.kidName}.`,
      'FreeSessionRequest',
      saved._id.toString()
    );
    return saved;
  }

  async findFreeSessionRequests(pagination: PaginationDto) {
    const filter = { status: RequestStatus.PENDING };
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.freeSessionRequestModel
        .find(filter)
        .populate('selectedSessionId')
        .populate('locationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.freeSessionRequestModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async countFreeSessionRequests() {
    return this.freeSessionRequestModel.countDocuments({ status: RequestStatus.PENDING }).exec();
  }

  async selectFreeSessionRequest(id: string, actorId: string, sessionId?: string) {
    const request = await this.freeSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Free session request not found',
      });
    }

    request.status = RequestStatus.SELECTED;
    if (sessionId) {
      request.selectedSessionId = sessionId as any;
    }
    await request.save();

    await this.notificationService.sendFreeSessionConfirmation({
      email: request.email,
      phone: request.phone,
      parentName: request.parentName,
      kidName: request.kidName,
      sessionId: request.selectedSessionId?.toString(),
    });

    const parent = await this.userModel
      .findOne({ email: request.email.toLowerCase(), role: UserRole.PARENT })
      .select('_id')
      .lean()
      .exec();
    if (parent && (parent as any)._id) {
      await this.notificationService.createNotification({
        userId: (parent as any)._id.toString(),
        type: NotificationType.FREE_SESSION_SELECTED,
        title: 'Free session confirmed',
        body: `Your free session request for ${request.kidName} has been confirmed.`,
        entityType: 'FreeSessionRequest',
        entityId: id,
      });
    }

    await this.auditService.log({
      actorId,
      action: 'SELECT_FREE_SESSION_REQUEST',
      entityType: 'FreeSessionRequest',
      entityId: id,
    });

    return request;
  }

  // Reschedule Requests
  async createRescheduleRequest(dto: CreateRescheduleRequestDto, requestedById: string) {
    const session = await this.sessionModel.findById(dto.sessionId).exec();
    if (!session) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Session not found',
      });
    }

    const request = new this.rescheduleRequestModel({
      sessionId: new Types.ObjectId(dto.sessionId),
      requestedBy: new Types.ObjectId(requestedById),
      newDateTime: new Date(dto.newDateTime),
      reason: dto.reason,
      status: RequestStatus.PENDING,
    });
    const saved = await request.save();

    await this.auditService.log({
      actorId: requestedById,
      action: 'CREATE_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: saved._id.toString(),
      metadata: dto,
    });

    await this.notifyAdmins(
      NotificationType.RESCHEDULE_REQUEST,
      'New reschedule request',
      'A session reschedule has been requested.',
      'RescheduleRequest',
      saved._id.toString()
    );
    const sessionWithCoach = await this.sessionModel
      .findById(dto.sessionId)
      .select('coachId')
      .lean()
      .exec();
    if (sessionWithCoach && (sessionWithCoach as any).coachId) {
      const coachId =
        (sessionWithCoach as any).coachId?.toString?.() ?? (sessionWithCoach as any).coachId;
      if (coachId) {
        await this.notificationService.createNotification({
          userId: coachId,
          type: NotificationType.RESCHEDULE_REQUEST,
          title: 'Reschedule request',
          body: 'A reschedule has been requested for one of your sessions.',
          entityType: 'RescheduleRequest',
          entityId: saved._id.toString(),
        });
      }
    }

    return saved.populate(['sessionId', 'requestedBy']);
  }

  async findRescheduleRequests(pagination: PaginationDto) {
    const filter = { status: RequestStatus.PENDING };
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.rescheduleRequestModel
        .find(filter)
        .populate('sessionId')
        .populate('requestedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.rescheduleRequestModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async countRescheduleRequests() {
    return this.rescheduleRequestModel.countDocuments({ status: RequestStatus.PENDING }).exec();
  }

  async approveRescheduleRequest(id: string, actorId: string) {
    const request = await this.rescheduleRequestModel
      .findById(id)
      .populate('sessionId')
      .populate('requestedBy', 'email')
      .exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    request.status = RequestStatus.APPROVED;
    request.processedAt = new Date();
    await request.save();

    const requestedById =
      request.requestedBy instanceof Types.ObjectId
        ? request.requestedBy.toString()
        : ((request.requestedBy as any)?._id?.toString?.() ?? (request.requestedBy as any)?.id);
    if (requestedById) {
      await this.notificationService.createNotification({
        userId: requestedById,
        type: NotificationType.RESCHEDULE_APPROVED,
        title: 'Reschedule approved',
        body: 'Your session reschedule request has been approved.',
        entityType: 'RescheduleRequest',
        entityId: id,
      });
    }

    await this.auditService.log({
      actorId,
      action: 'APPROVE_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
    });

    return request;
  }

  async denyRescheduleRequest(id: string, actorId: string) {
    const request = await this.rescheduleRequestModel
      .findById(id)
      .populate('requestedBy', 'email')
      .exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    request.status = RequestStatus.DENIED;
    request.processedAt = new Date();
    await request.save();

    const requestedById =
      request.requestedBy instanceof Types.ObjectId
        ? request.requestedBy.toString()
        : ((request.requestedBy as any)?._id?.toString?.() ?? (request.requestedBy as any)?.id);
    if (requestedById) {
      await this.notificationService.createNotification({
        userId: requestedById,
        type: NotificationType.RESCHEDULE_DENIED,
        title: 'Reschedule denied',
        body: 'Your session reschedule request has been denied.',
        entityType: 'RescheduleRequest',
        entityId: id,
      });
    }

    await this.auditService.log({
      actorId,
      action: 'DENY_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
    });

    return request;
  }

  // Extra Session Requests
  async createExtraSessionRequest(
    dto: CreateExtraSessionRequestDto,
    actorId: string,
    actorRole: UserRole
  ) {
    const parentId = actorRole === UserRole.PARENT ? actorId : dto.parentId;
    if (!parentId) {
      throw new NotFoundException({
        errorCode: ErrorCode.INVALID_INPUT,
        message: 'Parent ID is required (required in body when creating as admin)',
      });
    }

    // Validate kid belongs to parent when PARENT creates
    if (actorRole === UserRole.PARENT) {
      const kid = await this.kidModel.findOne({ _id: dto.kidId, parentId }).exec();
      if (!kid) {
        throw new NotFoundException({
          errorCode: ErrorCode.NOT_FOUND,
          message: 'Kid not found or does not belong to you',
        });
      }
    }

    const request = new this.extraSessionRequestModel({
      parentId: new Types.ObjectId(parentId),
      kidId: new Types.ObjectId(dto.kidId),
      coachId: new Types.ObjectId(dto.coachId),
      sessionType: dto.sessionType,
      locationId: new Types.ObjectId(dto.locationId),
      preferredDateTime: new Date(dto.preferredDateTime),
      status: RequestStatus.PENDING,
    });
    const saved = await request.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_EXTRA_SESSION_REQUEST',
      entityType: 'ExtraSessionRequest',
      entityId: saved._id.toString(),
      metadata: { ...dto, parentId },
    });

    await this.notifyAdmins(
      NotificationType.EXTRA_SESSION_REQUEST,
      'New extra session request',
      'An extra session has been requested.',
      'ExtraSessionRequest',
      saved._id.toString()
    );
    if (dto.coachId) {
      await this.notificationService.createNotification({
        userId: dto.coachId,
        type: NotificationType.EXTRA_SESSION_REQUEST,
        title: 'Extra session request',
        body: 'A parent has requested an extra session with you.',
        entityType: 'ExtraSessionRequest',
        entityId: saved._id.toString(),
      });
    }

    return saved.populate(['parentId', 'kidId', 'coachId', 'locationId']);
  }

  async findExtraSessionRequests(pagination: PaginationDto) {
    const filter = { status: RequestStatus.PENDING };
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.extraSessionRequestModel
        .find(filter)
        .populate('parentId', 'email parentProfile')
        .populate('kidId')
        .populate('coachId', 'email coachProfile')
        .populate('locationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.extraSessionRequestModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async approveExtraSessionRequest(id: string, actorId: string) {
    const request = await this.extraSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Extra session request not found',
      });
    }

    request.status = RequestStatus.APPROVED;
    await request.save();

    const parentId = request.parentId?.toString?.();
    if (parentId) {
      await this.notificationService.createNotification({
        userId: parentId,
        type: NotificationType.EXTRA_SESSION_APPROVED,
        title: 'Extra session approved',
        body: 'Your extra session request has been approved.',
        entityType: 'ExtraSessionRequest',
        entityId: id,
      });
    }

    await this.auditService.log({
      actorId,
      action: 'APPROVE_EXTRA_SESSION_REQUEST',
      entityType: 'ExtraSessionRequest',
      entityId: id,
    });

    return request;
  }

  async denyExtraSessionRequest(id: string, actorId: string) {
    const request = await this.extraSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Extra session request not found',
      });
    }

    request.status = RequestStatus.DENIED;
    await request.save();

    const parentId = request.parentId?.toString?.();
    if (parentId) {
      await this.notificationService.createNotification({
        userId: parentId,
        type: NotificationType.EXTRA_SESSION_DENIED,
        title: 'Extra session denied',
        body: 'Your extra session request has been denied.',
        entityType: 'ExtraSessionRequest',
        entityId: id,
      });
    }

    await this.auditService.log({
      actorId,
      action: 'DENY_EXTRA_SESSION_REQUEST',
      entityType: 'ExtraSessionRequest',
      entityId: id,
    });

    return request;
  }

  // Delete methods
  async deleteFreeSessionRequest(id: string, actorId: string) {
    const request = await this.freeSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Free session request not found',
      });
    }

    await this.freeSessionRequestModel.findByIdAndDelete(id).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_FREE_SESSION_REQUEST',
      entityType: 'FreeSessionRequest',
      entityId: id,
    });

    return { message: 'Free session request deleted successfully' };
  }

  async deleteRescheduleRequest(id: string, actorId: string) {
    const request = await this.rescheduleRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    await this.rescheduleRequestModel.findByIdAndDelete(id).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
    });

    return { message: 'Reschedule request deleted successfully' };
  }

  async deleteExtraSessionRequest(id: string, actorId: string) {
    const request = await this.extraSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Extra session request not found',
      });
    }

    await this.extraSessionRequestModel.findByIdAndDelete(id).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_EXTRA_SESSION_REQUEST',
      entityType: 'ExtraSessionRequest',
      entityId: id,
    });

    return { message: 'Extra session request deleted successfully' };
  }

  // Update/PATCH methods
  async updateFreeSessionRequest(
    id: string,
    updateData: { status?: RequestStatus; selectedSessionId?: string },
    actorId: string
  ) {
    const request = await this.freeSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Free session request not found',
      });
    }

    if (updateData.status) {
      request.status = updateData.status;
    }
    if (updateData.selectedSessionId) {
      request.selectedSessionId = updateData.selectedSessionId as any;
    }

    await request.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_FREE_SESSION_REQUEST',
      entityType: 'FreeSessionRequest',
      entityId: id,
      metadata: updateData,
    });

    return request;
  }

  async updateRescheduleRequest(
    id: string,
    updateData: { status?: RequestStatus; newDateTime?: Date; reason?: string },
    actorId: string
  ) {
    const request = await this.rescheduleRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    if (updateData.status !== undefined) {
      request.status = updateData.status;
      if (updateData.status !== RequestStatus.PENDING) {
        request.processedAt = new Date();
      }
    }
    if (updateData.newDateTime) {
      request.newDateTime = updateData.newDateTime;
    }
    if (updateData.reason) {
      request.reason = updateData.reason;
    }

    await request.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
      metadata: updateData,
    });

    return request;
  }

  async updateExtraSessionRequest(
    id: string,
    updateData: { status?: RequestStatus; preferredDateTime?: Date },
    actorId: string
  ) {
    const request = await this.extraSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Extra session request not found',
      });
    }

    if (updateData.status !== undefined) {
      request.status = updateData.status;
    }
    if (updateData.preferredDateTime) {
      request.preferredDateTime = updateData.preferredDateTime;
    }

    await request.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_EXTRA_SESSION_REQUEST',
      entityType: 'ExtraSessionRequest',
      entityId: id,
      metadata: updateData,
    });

    return request;
  }

  // User Registration Requests
  async findUserRegistrationRequests(pagination: PaginationDto) {
    const filter = { status: RequestStatus.PENDING };
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.userRegistrationRequestModel
        .find(filter)
        .populate('parentId', 'email phone parentProfile status')
        .populate('processedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.userRegistrationRequestModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async approveUserRegistrationRequest(id: string, actorId: string | Types.ObjectId) {
    try {
      const request = await this.userRegistrationRequestModel.findById(id).exec();

      if (!request) {
        throw new NotFoundException({
          errorCode: ErrorCode.NOT_FOUND,
          message: 'User registration request not found',
        });
      }

      // Get parentId - handle both ObjectId and populated object
      if (!request.parentId) {
        throw new NotFoundException({
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: 'Parent ID not found in registration request',
        });
      }

      let parentId: Types.ObjectId | string;
      if (request.parentId instanceof Types.ObjectId) {
        parentId = request.parentId;
      } else if (typeof request.parentId === 'object' && request.parentId !== null) {
        parentId = (request.parentId as any)._id || (request.parentId as any).id;
        if (!parentId) {
          throw new NotFoundException({
            errorCode: ErrorCode.USER_NOT_FOUND,
            message: 'Invalid parent ID in registration request',
          });
        }
      } else {
        parentId = request.parentId as string;
      }

      // Convert to string if needed for findById
      const parentIdString =
        parentId instanceof Types.ObjectId ? parentId.toString() : String(parentId);
      const parent = await this.userModel.findById(parentIdString).exec();
      if (!parent) {
        throw new NotFoundException({
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: 'Parent not found',
        });
      }

      // Approve parent - use updateOne to ensure field exists
      await this.userModel.updateOne({ _id: parent._id }, { $set: { isApproved: true } }).exec();

      // Approve all children - use updateMany to ensure field exists
      await this.kidModel
        .updateMany({ parentId: parent._id }, { $set: { isApproved: true } })
        .exec();

      // Update request status
      request.status = RequestStatus.APPROVED;
      request.processedAt = new Date();

      // Safely convert actorId to ObjectId
      if (actorId) {
        try {
          if (actorId instanceof Types.ObjectId) {
            request.processedBy = actorId;
          } else if (typeof actorId === 'string' && Types.ObjectId.isValid(actorId)) {
            request.processedBy = new Types.ObjectId(actorId);
          } else {
            // If actorId is invalid, we can still proceed without processedBy
            console.warn(`Invalid actorId format: ${actorId} (type: ${typeof actorId})`);
          }
        } catch (error) {
          console.warn(`Failed to convert actorId to ObjectId: ${error}`);
          // Continue without processedBy
        }
      }

      await request.save();

      await this.notificationService.createNotification({
        userId: parentIdString,
        type: NotificationType.REGISTRATION_APPROVED,
        title: 'Registration approved',
        body: 'Your account has been approved. You can now sign in.',
        entityType: 'UserRegistrationRequest',
        entityId: id,
      });

      await this.notificationService.sendRegistrationApproved({
        email: parent.email,
        phone: parent.phone ?? '',
        parentName: parent.parentProfile?.name,
      });

      // Get kids count for audit
      const kids = await this.kidModel.find({ parentId: parent._id }).exec();

      await this.auditService.log({
        actorId: actorId instanceof Types.ObjectId ? actorId.toString() : actorId,
        action: 'APPROVE_USER_REGISTRATION_REQUEST',
        entityType: 'UserRegistrationRequest',
        entityId: id,
        metadata: {
          parentId: parent._id.toString(),
          email: parent.email,
          kidsCount: kids.length,
        },
      });

      return request;
    } catch (error) {
      console.error('Error approving user registration request:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException({
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        message: `Failed to approve registration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  async rejectUserRegistrationRequest(id: string, actorId: string | Types.ObjectId) {
    const request = await this.userRegistrationRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'User registration request not found',
      });
    }

    // Get parentId - handle both ObjectId and populated object
    if (!request.parentId) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent ID not found in registration request',
      });
    }

    let parentId: Types.ObjectId | string;
    if (request.parentId instanceof Types.ObjectId) {
      parentId = request.parentId;
    } else if (typeof request.parentId === 'object' && request.parentId !== null) {
      parentId = (request.parentId as any)._id || (request.parentId as any).id;
      if (!parentId) {
        throw new NotFoundException({
          errorCode: ErrorCode.USER_NOT_FOUND,
          message: 'Invalid parent ID in registration request',
        });
      }
    } else {
      parentId = request.parentId as string;
    }

    // Convert to string if needed for findById
    const parentIdString =
      parentId instanceof Types.ObjectId ? parentId.toString() : String(parentId);
    const parent = await this.userModel.findById(parentIdString).exec();
    if (!parent) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'Parent not found',
      });
    }

    // Soft delete parent (set status to INACTIVE)
    parent.status = UserStatus.INACTIVE;
    await parent.save();

    // Get children count for audit
    const kids = await this.kidModel.find({ parentId: parent._id }).exec();

    // Update request status
    request.status = RequestStatus.DENIED;
    request.processedAt = new Date();

    // Safely convert actorId to ObjectId
    if (actorId) {
      try {
        if (actorId instanceof Types.ObjectId) {
          request.processedBy = actorId;
        } else if (typeof actorId === 'string' && Types.ObjectId.isValid(actorId)) {
          request.processedBy = new Types.ObjectId(actorId);
        } else {
          // If actorId is invalid, we can still proceed without processedBy
          console.warn(`Invalid actorId format: ${actorId} (type: ${typeof actorId})`);
        }
      } catch (error) {
        console.warn(`Failed to convert actorId to ObjectId: ${error}`);
        // Continue without processedBy
      }
    }

    await request.save();

    await this.notificationService.createNotification({
      userId: parentIdString,
      type: NotificationType.REGISTRATION_REJECTED,
      title: 'Registration not approved',
      body: 'Your account registration was not approved. Please contact support if you have questions.',
      entityType: 'UserRegistrationRequest',
      entityId: id,
    });

    await this.auditService.log({
      actorId: actorId instanceof Types.ObjectId ? actorId.toString() : actorId,
      action: 'REJECT_USER_REGISTRATION_REQUEST',
      entityType: 'UserRegistrationRequest',
      entityId: id,
      metadata: {
        parentId: parent._id.toString(),
        email: parent.email,
        kidsCount: kids.length,
      },
    });

    return request;
  }
}
