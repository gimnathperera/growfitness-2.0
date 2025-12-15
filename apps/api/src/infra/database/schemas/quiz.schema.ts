import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BannerTargetAudience } from '@grow-fitness/shared-types';

export type QuizDocument = Quiz & Document;

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

@Schema({ timestamps: true })
export class QuizQuestion {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true, type: String, enum: QuestionType })
  type: QuestionType;

  @Prop({ type: [String], required: false })
  options?: string[]; // For multiple choice

  @Prop({ required: true })
  correctAnswer: string;

  @Prop({ required: false })
  points: number;
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [QuizQuestion], required: true })
  questions: QuizQuestion[];

  @Prop({ required: true, type: String, enum: BannerTargetAudience })
  targetAudience: BannerTargetAudience;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: false })
  passingScore?: number; // Percentage
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

// Indexes
QuizSchema.index({ targetAudience: 1 });
QuizSchema.index({ isActive: 1 });

