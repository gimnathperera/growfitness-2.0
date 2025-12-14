import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@grow-fitness/shared-types';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class QuizzesController {
  @Get()
  findAll() {
    return { message: 'Quizzes module - Coming soon' };
  }
}

@Module({
  controllers: [QuizzesController],
})
export class QuizzesModule {}

