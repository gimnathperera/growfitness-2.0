import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersMeCoachProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('coach-profile')
  @Roles(UserRole.COACH)
  @ApiOperation({ summary: 'Get logged-in coach profile (read-only)' })
  @ApiResponse({ status: 200, description: 'Coach user document' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  findProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findCoachSelf(userId);
  }
}
