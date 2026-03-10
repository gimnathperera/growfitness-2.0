import { QuizzesService, UpdateQuizDto } from './quizzes.service';
import { CreateQuizDto as CreateQuizDtoClass } from './dto/create-quiz.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class QuizzesController {
    private readonly quizzesService;
    constructor(quizzesService: QuizzesService);
    findAll(pagination: PaginationDto, targetAudience?: string): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").QuizDocument, {}, {}> & import("../../infra/database/schemas").Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").QuizDocument, {}, {}> & import("../../infra/database/schemas").Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createQuizDto: CreateQuizDtoClass, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").QuizDocument, {}, {}> & import("../../infra/database/schemas").Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateQuizDto: UpdateQuizDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").QuizDocument, {}, {}> & import("../../infra/database/schemas").Quiz & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
