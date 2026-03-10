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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQuizDto = exports.QuizQuestionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const shared_types_1 = require("@grow-fitness/shared-types");
const quiz_schema_1 = require("../../../infra/database/schemas/quiz.schema");
class QuizQuestionDto {
    question;
    type;
    options;
    correctAnswer;
    points;
}
exports.QuizQuestionDto = QuizQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question text',
        example: 'What is the recommended daily water intake for children?',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Question type',
        example: quiz_schema_1.QuestionType.MULTIPLE_CHOICE,
        enum: quiz_schema_1.QuestionType,
    }),
    (0, class_validator_1.IsEnum)(quiz_schema_1.QuestionType),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Answer options (required for MULTIPLE_CHOICE type)',
        example: ['4-6 cups', '6-8 cups', '8-10 cups', '10-12 cups'],
        required: false,
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QuizQuestionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Correct answer',
        example: '6-8 cups',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuizQuestionDto.prototype, "correctAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Points awarded for this question',
        example: 10,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QuizQuestionDto.prototype, "points", void 0);
class CreateQuizDto {
    title;
    description;
    questions;
    targetAudience;
    passingScore;
}
exports.CreateQuizDto = CreateQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Title of the quiz',
        example: 'Fitness Assessment Quiz',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Description of the quiz',
        example: 'A quiz to assess fitness knowledge',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of quiz questions',
        type: [QuizQuestionDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => QuizQuestionDto),
    __metadata("design:type", Array)
], CreateQuizDto.prototype, "questions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Target audience for the quiz',
        example: shared_types_1.BannerTargetAudience.PARENT,
        enum: shared_types_1.BannerTargetAudience,
    }),
    (0, class_validator_1.IsEnum)(shared_types_1.BannerTargetAudience),
    __metadata("design:type", String)
], CreateQuizDto.prototype, "targetAudience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Passing score percentage (0-100)',
        example: 70,
        required: false,
        minimum: 0,
        maximum: 100,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateQuizDto.prototype, "passingScore", void 0);
//# sourceMappingURL=create-quiz.dto.js.map