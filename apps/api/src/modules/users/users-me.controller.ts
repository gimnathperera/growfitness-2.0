import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@grow-fitness/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersMeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get logged-in user profile (parent or coach)' })
  @ApiResponse({ status: 200, description: 'User document with role-specific profile' })
  @ApiResponse({ status: 403, description: 'Role not supported' })
  getMe(@CurrentUser() user: JwtPayload) {
    if (user.role === UserRole.PARENT) {
      return this.usersService.findParentSelf(user.sub);
    }
    if (user.role === UserRole.COACH) {
      return this.usersService.findCoachSelf(user.sub);
    }
    throw new ForbiddenException('Profile is not available for this role');
  }
}
