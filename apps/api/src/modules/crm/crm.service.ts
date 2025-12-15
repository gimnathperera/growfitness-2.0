import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CrmContact, CrmContactDocument } from '../../infra/database/schemas/crm-contact.schema';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

export interface CreateCrmContactDto {
  parentId?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCrmContactDto {
  status?: string;
  followUpDate?: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface AddNoteDto {
  note: string;
}

@Injectable()
export class CrmService {
  constructor(
    @InjectModel(CrmContact.name) private crmContactModel: Model<CrmContactDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, status?: string, parentId?: string) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (parentId) {
      query.parentId = parentId;
    }

    const [data, total] = await Promise.all([
      this.crmContactModel
        .find(query)
        .populate('parentId', 'email phone parentProfile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .exec(),
      this.crmContactModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const contact = await this.crmContactModel.findById(id).populate('parentId', 'email phone parentProfile').exec();

    if (!contact) {
      throw new NotFoundException({
        errorCode: ErrorCode.CRM_CONTACT_NOT_FOUND,
        message: 'CRM contact not found',
      });
    }

    return contact;
  }

  async create(createCrmContactDto: CreateCrmContactDto, actorId: string) {
    const contact = new this.crmContactModel({
      ...createCrmContactDto,
      status: createCrmContactDto.status || 'LEAD',
      notes: [],
    });
    await contact.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_CRM_CONTACT',
      entityType: 'CrmContact',
      entityId: contact._id.toString(),
      metadata: createCrmContactDto as unknown as Record<string, unknown>,
    });

    return contact;
  }

  async update(id: string, updateCrmContactDto: UpdateCrmContactDto, actorId: string) {
    const contact = await this.crmContactModel.findById(id).exec();

    if (!contact) {
      throw new NotFoundException({
        errorCode: ErrorCode.CRM_CONTACT_NOT_FOUND,
        message: 'CRM contact not found',
      });
    }

    Object.assign(contact, updateCrmContactDto);
    await contact.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_CRM_CONTACT',
      entityType: 'CrmContact',
      entityId: id,
      metadata: updateCrmContactDto as unknown as Record<string, unknown>,
    });

    return contact;
  }

  async addNote(id: string, addNoteDto: AddNoteDto, actorId: string) {
    const contact = await this.crmContactModel.findById(id).exec();

    if (!contact) {
      throw new NotFoundException({
        errorCode: ErrorCode.CRM_CONTACT_NOT_FOUND,
        message: 'CRM contact not found',
      });
    }

    contact.notes.push({
      note: addNoteDto.note,
      createdBy: new Types.ObjectId(actorId),
      createdAt: new Date(),
    });
    await contact.save();

    await this.auditService.log({
      actorId,
      action: 'ADD_CRM_NOTE',
      entityType: 'CrmContact',
      entityId: id,
      metadata: addNoteDto as unknown as Record<string, unknown>,
    });

    return contact;
  }

  async delete(id: string, actorId: string) {
    const contact = await this.crmContactModel.findById(id).exec();

    if (!contact) {
      throw new NotFoundException({
        errorCode: ErrorCode.CRM_CONTACT_NOT_FOUND,
        message: 'CRM contact not found',
      });
    }

    await this.crmContactModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_CRM_CONTACT',
      entityType: 'CrmContact',
      entityId: id,
    });

    return { message: 'CRM contact deleted successfully' };
  }
}

