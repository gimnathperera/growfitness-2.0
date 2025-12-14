import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FreeSessionRequest, FreeSessionRequestDocument } from '../../infra/database/schemas/free-session-request.schema';
import { RescheduleRequest, RescheduleRequestDocument } from '../../infra/database/schemas/reschedule-request.schema';
import { ExtraSessionRequest, ExtraSessionRequestDocument } from '../../infra/database/schemas/extra-session-request.schema';
import { RequestStatus } from '@grow-fitness/shared-types';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(FreeSessionRequest.name)
    private freeSessionRequestModel: Model<FreeSessionRequestDocument>,
    @InjectModel(RescheduleRequest.name)
    private rescheduleRequestModel: Model<RescheduleRequestDocument>,
    @InjectModel(ExtraSessionRequest.name)
    private extraSessionRequestModel: Model<ExtraSessionRequestDocument>,
    private auditService: AuditService,
    private notificationService: NotificationService
  ) {}

  // Free Session Requests
  async findFreeSessionRequests(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.freeSessionRequestModel
        .find()
        .populate('selectedSessionId')
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

  async selectFreeSessionRequest(id: string, actorId: string) {
    const request = await this.freeSessionRequestModel.findById(id).exec();

    if (!request) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Free session request not found',
      });
    }

    request.status = RequestStatus.SELECTED;
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
}

