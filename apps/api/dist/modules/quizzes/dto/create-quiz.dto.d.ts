import { BannerTargetAudience } from '@grow-fitness/shared-types';
import { QuestionType } from '../../../infra/database/schemas/quiz.schema';
export declare class QuizQuestionDto {
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string;
    points?: number;
}
export declare class CreateQuizDto {
    title: string;
    description?: string;
    questions: QuizQuestionDto[];
    targetAudience: BannerTargetAudience;
    passingScore?: number;
}
