import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error as MongooseError } from 'mongoose';
import { Quiz, QuizDocument, QuestionType } from '../../infra/database/schemas/quiz.schema';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
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

@Injectable()
export class QuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto, targetAudience?: string) {
    const skip = (pagination.page - 1) * pagination.limit;
    const query: any = {};
    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    const [data, total] = await Promise.all([
      this.quizModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(pagination.limit).exec(),
      this.quizModel.countDocuments(query).exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz) {
      throw new NotFoundException({
        errorCode: ErrorCode.QUIZ_NOT_FOUND,
        message: 'Quiz not found',
      });
    }

    return quiz;
  }

  async create(createQuizDto: CreateQuizDto, actorId: string) {
    try {
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
        metadata: createQuizDto as unknown as Record<string, unknown>,
      });

      return quiz;
    } catch (error) {
      if (error instanceof MongooseError.ValidationError) {
        const errorMessages = Object.keys(error.errors).map(
          key => `${key}: ${error.errors[key].message}`
        );
        throw new BadRequestException({
          errorCode: ErrorCode.VALIDATION_ERROR,
          message: 'Quiz validation failed',
          errors: errorMessages,
        });
      }
      throw error;
    }
  }

  async update(id: string, updateQuizDto: UpdateQuizDto, actorId: string) {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz) {
      throw new NotFoundException({
        errorCode: ErrorCode.QUIZ_NOT_FOUND,
        message: 'Quiz not found',
      });
    }

    Object.assign(quiz, updateQuizDto);
    await quiz.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_QUIZ',
      entityType: 'Quiz',
      entityId: id,
      metadata: updateQuizDto as unknown as Record<string, unknown>,
    });

    return quiz;
  }

  async delete(id: string, actorId: string) {
    const quiz = await this.quizModel.findById(id).exec();

    if (!quiz) {
      throw new NotFoundException({
        errorCode: ErrorCode.QUIZ_NOT_FOUND,
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
}
