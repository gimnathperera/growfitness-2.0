import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@grow-fitness/shared-types';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  @Get()
  findAll() {
    return { message: 'Reports module - Coming soon' };
  }
}

@Module({
  controllers: [ReportsController],
})
export class ReportsModule {}

