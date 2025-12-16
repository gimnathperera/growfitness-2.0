import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
import { QuestionType } from '../../../infra/database/schemas/quiz.schema';

export class QuizQuestionDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is the recommended daily water intake for children?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Question type',
    example: QuestionType.MULTIPLE_CHOICE,
    enum: QuestionType,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({
    description: 'Answer options (required for MULTIPLE_CHOICE type)',
    example: ['4-6 cups', '6-8 cups', '8-10 cups', '10-12 cups'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({
    description: 'Correct answer',
    example: '6-8 cups',
  })
  @IsString()
  correctAnswer: string;

  @ApiProperty({
    description: 'Points awarded for this question',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  points?: number;
}

export class CreateQuizDto {
  @ApiProperty({
    description: 'Title of the quiz',
    example: 'Fitness Assessment Quiz',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the quiz',
    example: 'A quiz to assess fitness knowledge',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of quiz questions',
    type: [QuizQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];

  @ApiProperty({
    description: 'Target audience for the quiz',
    example: BannerTargetAudience.PARENT,
    enum: BannerTargetAudience,
  })
  @IsEnum(BannerTargetAudience)
  targetAudience: BannerTargetAudience;

  @ApiProperty({
    description: 'Passing score percentage (0-100)',
    example: 70,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;
}
