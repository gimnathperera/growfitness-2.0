import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { GetTestimonialsQueryDto } from './dto/get-testimonials-query.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
  CreateTestimonialSchema,
  UpdateTestimonialSchema,
} from '@grow-fitness/shared-schemas';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateTestimonialBodyDto } from './dto/create-testimonial-body.dto';

@ApiTags('testimonials')
@ApiBearerAuth('JWT-auth')
@Controller('testimonials')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all testimonials',
    description: 'Public endpoint. No auth required. Returns paginated testimonials. Use activeOnly=false to include inactive.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'If true, return only active testimonials (default: true for public)',
  })
  @ApiResponse({ status: 200, description: 'List of testimonials' })
  findAll(@Query() query: GetTestimonialsQueryDto) {
    const { activeOnly, ...pagination } = query;
    const onlyActive = activeOnly !== 'false';
    return this.testimonialsService.findAll(pagination, onlyActive);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Get testimonial by ID',
    description: 'Public endpoint. No auth required.',
  })
  @ApiResponse({ status: 200, description: 'Testimonial details' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.testimonialsService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new testimonial',
    description: 'Admin only. Requires JWT.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorName: { type: 'string', description: 'Author/parent name' },
        content: { type: 'string', description: 'Testimonial text' },
        childName: { type: 'string', description: "Child's name" },
        childAge: { type: 'number', description: "Child's age" },
        membershipDuration: { type: 'string', description: 'e.g. Member for 6 months' },
        rating: { type: 'number', minimum: 1, maximum: 5, default: 5 },
        order: { type: 'number', minimum: 0, default: 0 },
        isActive: { type: 'boolean', default: true },
      },
      required: ['authorName', 'content'],
    },
  })
  @ApiResponse({ status: 201, description: 'Testimonial created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin JWT required' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(
    @Body(new ZodValidationPipe(CreateTestimonialSchema)) createDto: CreateTestimonialBodyDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.testimonialsService.create(createDto as CreateTestimonialDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a testimonial',
    description: 'Admin only. Requires JWT.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        authorName: { type: 'string' },
        content: { type: 'string' },
        childName: { type: 'string' },
        childAge: { type: 'number' },
        membershipDuration: { type: 'string' },
        rating: { type: 'number' },
        order: { type: 'number' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Testimonial updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin JWT required' })
  @ApiResponse({ status: 404, description: 'Testimonial not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format or validation error' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body(new ZodValidationPipe(UpdateTestimonialSchema)) updateDto: UpdateTestimonialDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.testimonialsService.update(id, updateDto, actorId);
  }
}
