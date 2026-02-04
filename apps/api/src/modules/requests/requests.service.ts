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
} from '@grow-fitness/shared-schemas';
import {
  UserRegistrationRequest,
  UserRegistrationRequestDocument,
} from '../../infra/database/schemas/user-registration-request.schema';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { Kid, KidDocument } from '../../infra/database/schemas/kid.schema';
import { RequestStatus, UserStatus } from '@grow-fitness/shared-types';
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
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

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
    return request.save();
  }

  async findFreeSessionRequests(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.freeSessionRequestModel
        .find()
        .populate('selectedSessionId')
        .populate('locationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.freeSessionRequestModel.countDocuments().exec(),
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

    // Send notification
    await this.notificationService.sendFreeSessionConfirmation({
      email: request.email,
      phone: request.phone,
      parentName: request.parentName,
      kidName: request.kidName,
      sessionId: request.selectedSessionId?.toString(),
    });

    await this.auditService.log({
      actorId,
      action: 'SELECT_FREE_SESSION_REQUEST',
      entityType: 'FreeSessionRequest',
      entityId: id,
    });

    return request;
  }

  // Reschedule Requests
  async findRescheduleRequests(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.rescheduleRequestModel
        .find()
        .populate('sessionId')
        .populate('requestedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.rescheduleRequestModel.countDocuments().exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async countRescheduleRequests() {
    return this.rescheduleRequestModel.countDocuments({ status: RequestStatus.PENDING }).exec();
  }

  async approveRescheduleRequest(id: string, actorId: string) {
    const request = await this.rescheduleRequestModel.findById(id).populate('sessionId').exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    request.status = RequestStatus.APPROVED;
    request.processedAt = new Date();
    await request.save();

    await this.auditService.log({
      actorId,
      action: 'APPROVE_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
    });

    return request;
  }

  async denyRescheduleRequest(id: string, actorId: string) {
    const request = await this.rescheduleRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Reschedule request not found',
      });
    }

    request.status = RequestStatus.DENIED;
    request.processedAt = new Date();
    await request.save();

    await this.auditService.log({
      actorId,
      action: 'DENY_RESCHEDULE_REQUEST',
      entityType: 'RescheduleRequest',
      entityId: id,
    });

    return request;
  }

  // Extra Session Requests
  async findExtraSessionRequests(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.extraSessionRequestModel
        .find()
        .populate('parentId', 'email parentProfile')
        .populate('kidId')
        .populate('coachId', 'email coachProfile')
        .populate('locationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.extraSessionRequestModel.countDocuments().exec(),
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
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.userRegistrationRequestModel
        .find()
        .populate('parentId', 'email phone parentProfile status')
        .populate('processedBy', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.userRegistrationRequestModel.countDocuments().exec(),
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
      const parentIdString = parentId instanceof Types.ObjectId ? parentId.toString() : String(parentId);
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
    const parentIdString = parentId instanceof Types.ObjectId ? parentId.toString() : String(parentId);
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
