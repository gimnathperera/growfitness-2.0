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
exports.QuizzesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const quiz_schema_1 = require("../../infra/database/schemas/quiz.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let QuizzesService = class QuizzesService {
    quizModel;
    auditService;
    constructor(quizModel, auditService) {
        this.quizModel = quizModel;
        this.auditService = auditService;
    }
    validateQuestions(questions) {
        if (!questions || questions.length === 0) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                message: 'Quiz must have at least one question',
            });
        }
        questions.forEach((q, index) => {
            if (q.type === quiz_schema_1.QuestionType.MULTIPLE_CHOICE) {
                if (!q.options || q.options.length < 2) {
                    throw new common_1.BadRequestException({
                        errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                        message: `Question ${index + 1}: Multiple choice questions must have at least 2 options`,
                    });
                }
                if (!q.options.includes(q.correctAnswer)) {
                    throw new common_1.BadRequestException({
                        errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                        message: `Question ${index + 1}: Correct answer must be one of the provided options`,
                    });
                }
            }
            else if (q.type === quiz_schema_1.QuestionType.TRUE_FALSE) {
                if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
                    throw new common_1.BadRequestException({
                        errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                        message: `Question ${index + 1}: True/False questions must have correct answer as "True" or "False"`,
                    });
                }
            }
        });
    }
    async findAll(pagination, targetAudience) {
        const skip = (pagination.page - 1) * pagination.limit;
        const query = {};
        if (targetAudience) {
            query.targetAudience = targetAudience;
        }
        const [data, total] = await Promise.all([
            this.quizModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
            this.quizModel.countDocuments(query).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.QUIZ_NOT_FOUND,
                message: 'Quiz not found',
            });
        }
        return quiz;
    }
    async create(createQuizDto, actorId) {
        try {
            this.validateQuestions(createQuizDto.questions);
            const quiz = new this.quizModel({
                ...createQuizDto,
                isActive: true,
            });
            await quiz.save();
            await this.auditService.log({
                actorId,
                action: 'CREATE_QUIZ',
                entityType: 'Quiz',
                entityId: quiz._id.toString(),
                metadata: createQuizDto,
            });
            return quiz;
        }
        catch (error) {
            if (error instanceof mongoose_2.Error.ValidationError) {
                const errorMessages = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`);
                throw new common_1.BadRequestException({
                    errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                    message: 'Quiz validation failed',
                    errors: errorMessages,
                });
            }
            throw error;
        }
    }
    async update(id, updateQuizDto, actorId) {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.QUIZ_NOT_FOUND,
                message: 'Quiz not found',
            });
        }
        if (updateQuizDto.questions) {
            this.validateQuestions(updateQuizDto.questions);
        }
        Object.assign(quiz, updateQuizDto);
        await quiz.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_QUIZ',
            entityType: 'Quiz',
            entityId: id,
            metadata: updateQuizDto,
        });
        return quiz;
    }
    async delete(id, actorId) {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.QUIZ_NOT_FOUND,
                message: 'Quiz not found',
            });
        }
        await this.quizModel.deleteOne({ _id: id }).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_QUIZ',
            entityType: 'Quiz',
            entityId: id,
        });
        return { message: 'Quiz deleted successfully' };
    }
};
exports.QuizzesService = QuizzesService;
exports.QuizzesService = QuizzesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(quiz_schema_1.Quiz.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], QuizzesService);
//# sourceMappingURL=quizzes.service.js.map