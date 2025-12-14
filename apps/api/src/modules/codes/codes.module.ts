import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@grow-fitness/shared-types';

@Controller('codes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CodesController {
  @Get()
  findAll() {
    return { message: 'Codes module - Coming soon' };
  }
}

@Module({
  controllers: [CodesController],
})
export class CodesModule {}

