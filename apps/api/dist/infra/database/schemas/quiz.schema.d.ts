import { Document } from 'mongoose';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
export type QuizDocument = Quiz & Document;
export declare enum QuestionType {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    TRUE_FALSE = "TRUE_FALSE",
    SHORT_ANSWER = "SHORT_ANSWER"
}
export declare class QuizQuestion {
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string;
    points: number;
}
export declare class Quiz {
    title: string;
    description?: string;
    questions: QuizQuestion[];
    targetAudience: BannerTargetAudience;
    isActive: boolean;
    passingScore?: number;
}
export declare const QuizSchema: import("mongoose").Schema<Quiz, import("mongoose").Model<Quiz, any, any, any, Document<unknown, any, Quiz, any, {}> & Quiz & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Quiz, Document<unknown, {}, import("mongoose").FlatRecord<Quiz>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Quiz> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
