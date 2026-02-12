import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Testimonial, TestimonialDocument } from '../../infra/database/schemas/testimonial.schema';
import { CreateTestimonialDto, UpdateTestimonialDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name) private testimonialModel: Model<TestimonialDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.testimonialModel
        .find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      this.testimonialModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const testimonial = await this.testimonialModel.findById(id).lean().exec();

    if (!testimonial) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Testimonial not found',
      });
    }

    return testimonial;
  }

  async create(createDto: CreateTestimonialDto, actorId: string) {
    const testimonial = new this.testimonialModel({
      ...createDto,
      order: createDto.order ?? 0,
      rating: createDto.rating ?? 5,
      isActive: createDto.isActive ?? true,
    });
    await testimonial.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_TESTIMONIAL',
      entityType: 'Testimonial',
      entityId: testimonial._id.toString(),
      metadata: createDto,
    });

    return this.findById(testimonial._id.toString());
  }

  async update(id: string, updateDto: UpdateTestimonialDto, actorId: string) {
    const testimonial = await this.testimonialModel.findById(id).exec();

    if (!testimonial) {
      throw new NotFoundException({
        errorCode: ErrorCode.NOT_FOUND,
        message: 'Testimonial not found',
      });
    }

    Object.assign(testimonial, updateDto);
    await testimonial.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_TESTIMONIAL',
      entityType: 'Testimonial',
      entityId: id,
      metadata: updateDto,
    });

    return this.findById(id);
  }
}
