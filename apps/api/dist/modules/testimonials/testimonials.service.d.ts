import { Model } from 'mongoose';
import { TestimonialDocument } from '../../infra/database/schemas/testimonial.schema';
import { CreateTestimonialDto, UpdateTestimonialDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class TestimonialsService {
    private testimonialModel;
    private auditService;
    constructor(testimonialModel: Model<TestimonialDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto, activeOnly?: boolean): Promise<PaginatedResponseDto<import("mongoose").FlattenMaps<TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createDto: CreateTestimonialDto, actorId: string): Promise<import("mongoose").FlattenMaps<TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateDto: UpdateTestimonialDto, actorId: string): Promise<import("mongoose").FlattenMaps<TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
