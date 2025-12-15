import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from '../../infra/database/schemas/resource.schema';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface CreateResourceDto {
  title: string;
  description?: string;
  type: string;
  content?: string;
  fileUrl?: string;
  externalUrl?: string;
  targetAudience: string;
  tags?: string[];
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  externalUrl?: string;
  isActive?: boolean;
  tags?: string[];
}

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, targetAudience?: string) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query: any = {};
    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    const [data, total] = await Promise.all([
      this.resourceModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
      this.resourceModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      throw new NotFoundException({
        errorCode: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Resource not found',
      });
    }

    return resource;
  }

  async create(createResourceDto: CreateResourceDto, actorId: string) {
    const resource = new this.resourceModel({
      ...createResourceDto,
      isActive: true,
      tags: createResourceDto.tags || [],
    });
    await resource.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_RESOURCE',
      entityType: 'Resource',
      entityId: resource._id.toString(),
      metadata: createResourceDto as unknown as Record<string, unknown>,
    });

    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto, actorId: string) {
    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      throw new NotFoundException({
        errorCode: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Resource not found',
      });
    }

    Object.assign(resource, updateResourceDto);
    await resource.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_RESOURCE',
      entityType: 'Resource',
      entityId: id,
      metadata: updateResourceDto as unknown as Record<string, unknown>,
    });

    return resource;
  }

  async delete(id: string, actorId: string) {
    const resource = await this.resourceModel.findById(id).exec();

    if (!resource) {
      throw new NotFoundException({
        errorCode: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Resource not found',
      });
    }

    await this.resourceModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_RESOURCE',
      entityType: 'Resource',
      entityId: id,
    });

    return { message: 'Resource deleted successfully' };
  }
}

