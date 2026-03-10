"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const testimonials_service_1 = require("./testimonials.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const get_testimonials_query_dto_1 = require("./dto/get-testimonials-query.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
const shared_schemas_1 = require("@grow-fitness/shared-schemas");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const create_testimonial_body_dto_1 = require("./dto/create-testimonial-body.dto");
let TestimonialsController = class TestimonialsController {
    testimonialsService;
    constructor(testimonialsService) {
        this.testimonialsService = testimonialsService;
    }
    findAll(query) {
        const { activeOnly, ...pagination } = query;
        const onlyActive = activeOnly !== 'false';
        return this.testimonialsService.findAll(pagination, onlyActive);
    }
    findById(id) {
        return this.testimonialsService.findById(id);
    }
    create(createDto, actorId) {
        return this.testimonialsService.create(createDto, actorId);
    }
    update(id, updateDto, actorId) {
        return this.testimonialsService.update(id, updateDto, actorId);
    }
};
exports.TestimonialsController = TestimonialsController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all testimonials',
        description: 'Public endpoint. No auth required. Returns paginated testimonials. Use activeOnly=false to include inactive.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 10, max: 100)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'activeOnly',
        required: false,
        type: Boolean,
        description: 'If true, return only active testimonials (default: true for public)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of testimonials' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_testimonials_query_dto_1.GetTestimonialsQueryDto]),
    __metadata("design:returntype", void 0)
], TestimonialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get testimonial by ID',
        description: 'Public endpoint. No auth required.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Testimonial details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Testimonial not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TestimonialsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new testimonial',
        description: 'Admin only. Requires JWT.',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Testimonial created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Admin JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.CreateTestimonialSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_testimonial_body_dto_1.CreateTestimonialBodyDto, String]),
    __metadata("design:returntype", void 0)
], TestimonialsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update a testimonial',
        description: 'Admin only. Requires JWT.',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Testimonial updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - Admin JWT required' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Testimonial not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format or validation error' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(shared_schemas_1.UpdateTestimonialSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], TestimonialsController.prototype, "update", null);
exports.TestimonialsController = TestimonialsController = __decorate([
    (0, swagger_1.ApiTags)('testimonials'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('testimonials'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [testimonials_service_1.TestimonialsService])
], TestimonialsController);
//# sourceMappingURL=testimonials.controller.js.map