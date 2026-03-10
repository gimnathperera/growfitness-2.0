import { Model } from 'mongoose';
import { Quiz, QuizDocument, QuestionType } from '../../infra/database/schemas/quiz.schema';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export interface QuizQuestionDto {
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string;
    points?: number;
}
export interface CreateQuizDto {
    title: string;
    description?: string;
    questions: QuizQuestionDto[];
    targetAudience: BannerTargetAudience;
    passingScore?: number;
}
export interface UpdateQuizDto {
    title?: string;
    description?: string;
    questions?: QuizQuestionDto[];
    isActive?: boolean;
    passingScore?: number;
}
export declare class QuizzesService {
    private quizModel;
    private auditService;
    constructor(quizModel: Model<QuizDocument>, auditService: AuditService);
    private validateQuestions;
    findAll(pagination: PaginationDto, targetAudience?: string): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, QuizDocument, {}, {}> & Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, QuizDocument, {}, {}> & Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createQuizDto: CreateQuizDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, QuizDocument, {}, {}> & Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateQuizDto: UpdateQuizDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, QuizDocument, {}, {}> & Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
