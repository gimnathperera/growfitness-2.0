import { TestimonialsService } from './testimonials.service';
import { GetTestimonialsQueryDto } from './dto/get-testimonials-query.dto';
import { UpdateTestimonialDto } from '@grow-fitness/shared-schemas';
import { CreateTestimonialBodyDto } from './dto/create-testimonial-body.dto';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    findAll(query: GetTestimonialsQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").FlattenMaps<import("../../infra/database/schemas/testimonial.schema").TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").FlattenMaps<import("../../infra/database/schemas/testimonial.schema").TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createDto: CreateTestimonialBodyDto, actorId: string): Promise<import("mongoose").FlattenMaps<import("../../infra/database/schemas/testimonial.schema").TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateDto: UpdateTestimonialDto, actorId: string): Promise<import("mongoose").FlattenMaps<import("../../infra/database/schemas/testimonial.schema").TestimonialDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
