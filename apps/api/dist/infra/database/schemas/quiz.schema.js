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
exports.QuizSchema = exports.Quiz = exports.QuizQuestion = exports.QuestionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const shared_types_1 = require("@grow-fitness/shared-types");
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
    QuestionType["SHORT_ANSWER"] = "SHORT_ANSWER";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
let QuizQuestion = class QuizQuestion {
    question;
    type;
    options;
    correctAnswer;
    points;
};
exports.QuizQuestion = QuizQuestion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "question", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: QuestionType }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: false }),
    __metadata("design:type", Array)
], QuizQuestion.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuizQuestion.prototype, "correctAnswer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], QuizQuestion.prototype, "points", void 0);
exports.QuizQuestion = QuizQuestion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QuizQuestion);
let Quiz = class Quiz {
    title;
    description;
    questions;
    targetAudience;
    isActive;
    passingScore;
};
exports.Quiz = Quiz;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Quiz.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [QuizQuestion], required: true }),
    __metadata("design:type", Array)
], Quiz.prototype, "questions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.BannerTargetAudience }),
    __metadata("design:type", String)
], Quiz.prototype, "targetAudience", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: true }),
    __metadata("design:type", Boolean)
], Quiz.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Quiz.prototype, "passingScore", void 0);
exports.Quiz = Quiz = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Quiz);
exports.QuizSchema = mongoose_1.SchemaFactory.createForClass(Quiz);
exports.QuizSchema.index({ targetAudience: 1 });
exports.QuizSchema.index({ isActive: 1 });
//# sourceMappingURL=quiz.schema.js.map