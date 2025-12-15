import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Code, CodeDocument } from '../../infra/database/schemas/code.schema';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface CreateCodeDto {
  code: string;
  type: string;
  discountPercentage?: number;
  discountAmount?: number;
  expiryDate?: Date;
  usageLimit: number;
  description?: string;
}

export interface UpdateCodeDto {
  status?: string;
  expiryDate?: Date;
  usageLimit?: number;
  description?: string;
}

@Injectable()
export class CodesService {
  constructor(
    @InjectModel(Code.name) private codeModel: Model<CodeDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.codeModel.find().sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
      this.codeModel.countDocuments().exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const code = await this.codeModel.findById(id).exec();

    if (!code) {
      throw new NotFoundException({
        errorCode: ErrorCode.CODE_NOT_FOUND,
        message: 'Code not found',
      });
    }

    return code;
  }

  async create(createCodeDto: CreateCodeDto, actorId: string) {
    // Validate discount fields
    if (createCodeDto.type === 'DISCOUNT' && !createCodeDto.discountPercentage && !createCodeDto.discountAmount) {
      throw new BadRequestException({
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'Discount percentage or amount is required for discount codes',
      });
    }

    const code = new this.codeModel({
      ...createCodeDto,
      code: createCodeDto.code.toUpperCase(),
      status: 'ACTIVE',
      usageCount: 0,
    });
    await code.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_CODE',
      entityType: 'Code',
      entityId: code._id.toString(),
      metadata: createCodeDto as unknown as Record<string, unknown>,
    });

    return code;
  }

  async update(id: string, updateCodeDto: UpdateCodeDto, actorId: string) {
    const code = await this.codeModel.findById(id).exec();

    if (!code) {
      throw new NotFoundException({
        errorCode: ErrorCode.CODE_NOT_FOUND,
        message: 'Code not found',
      });
    }

    // Check if expired
    if (code.expiryDate && new Date() > code.expiryDate) {
      updateCodeDto.status = 'EXPIRED';
    }

    Object.assign(code, updateCodeDto);
    await code.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_CODE',
      entityType: 'Code',
      entityId: id,
      metadata: updateCodeDto as unknown as Record<string, unknown>,
    });

    return code;
  }

  async delete(id: string, actorId: string) {
    const code = await this.codeModel.findById(id).exec();

    if (!code) {
      throw new NotFoundException({
        errorCode: ErrorCode.CODE_NOT_FOUND,
        message: 'Code not found',
      });
    }

    await this.codeModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_CODE',
      entityType: 'Code',
      entityId: id,
    });

    return { message: 'Code deleted successfully' };
  }
}

