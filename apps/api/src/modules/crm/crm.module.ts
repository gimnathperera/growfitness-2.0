import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@grow-fitness/shared-types';

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CrmController {
  @Get()
  findAll() {
    return { message: 'CRM module - Coming soon' };
  }
}

@Module({
  controllers: [CrmController],
})
export class CrmModule {}

