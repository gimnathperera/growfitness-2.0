import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { QuizzesService, CreateQuizDto, UpdateQuizDto } from './quizzes.service';
import { CreateQuizDto as CreateQuizDtoClass } from './dto/create-quiz.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ObjectIdValidationPipe } from '../../common/pipes/objectid-validation.pipe';

@ApiTags('quizzes')
@ApiBearerAuth('JWT-auth')
@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'targetAudience', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of quizzes' })
  findAll(@Query() pagination: PaginationDto, @Query('targetAudience') targetAudience?: string) {
    return this.quizzesService.findAll(pagination, targetAudience);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, description: 'Quiz details' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  findById(@Param('id', ObjectIdValidationPipe) id: string) {
    return this.quizzesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiBody({ type: CreateQuizDtoClass })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createQuizDto: CreateQuizDtoClass, @CurrentUser('sub') actorId: string) {
    return this.quizzesService.create(createQuizDto, actorId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Quiz title' },
        description: { type: 'string', description: 'Quiz description' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              type: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              correctAnswer: { type: 'string' },
              points: { type: 'number' },
            },
          },
        },
        isActive: { type: 'boolean', description: 'Whether the quiz is active' },
        passingScore: { type: 'number', description: 'Passing score percentage' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  update(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @CurrentUser('sub') actorId: string
  ) {
    return this.quizzesService.update(id, updateQuizDto, actorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  delete(@Param('id', ObjectIdValidationPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.quizzesService.delete(id, actorId);
  }
}
