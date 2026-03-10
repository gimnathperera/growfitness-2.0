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
exports.QuizzesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const quizzes_service_1 = require("./quizzes.service");
const create_quiz_dto_1 = require("./dto/create-quiz.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
let QuizzesController = class QuizzesController {
    quizzesService;
    constructor(quizzesService) {
        this.quizzesService = quizzesService;
    }
    findAll(pagination, targetAudience) {
        return this.quizzesService.findAll(pagination, targetAudience);
    }
    findById(id) {
        return this.quizzesService.findById(id);
    }
    create(createQuizDto, actorId) {
        return this.quizzesService.create(createQuizDto, actorId);
    }
    update(id, updateQuizDto, actorId) {
        return this.quizzesService.update(id, updateQuizDto, actorId);
    }
    delete(id, actorId) {
        return this.quizzesService.delete(id, actorId);
    }
};
exports.QuizzesController = QuizzesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all quizzes' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'targetAudience', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of quizzes' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('targetAudience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quiz by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new quiz' }),
    (0, swagger_1.ApiBody)({ type: create_quiz_dto_1.CreateQuizDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Quiz created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation failed' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quiz_dto_1.CreateQuizDto, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a quiz' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Quiz title' },
                description: { type: 'string', description: 'Quiz description' },
                questions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            question: { type: 'string' },
                            type: { type: 'string' },
                            options: { type: 'array', items: { type: 'string' } },
                            correctAnswer: { type: 'string' },
                            points: { type: 'number' },
                        },
                    },
                },
                isActive: { type: 'boolean', description: 'Whether the quiz is active' },
                passingScore: { type: 'number', description: 'Passing score percentage' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a quiz' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quiz deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Quiz not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QuizzesController.prototype, "delete", null);
exports.QuizzesController = QuizzesController = __decorate([
    (0, swagger_1.ApiTags)('quizzes'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('quizzes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [quizzes_service_1.QuizzesService])
], QuizzesController);
//# sourceMappingURL=quizzes.controller.js.map