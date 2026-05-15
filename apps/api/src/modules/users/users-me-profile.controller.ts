import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@grow-fitness/shared-types';
import { UpdateParentSelfSchema } from '@grow-fitness/shared-schemas';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import { UpdateParentSelfBodyDto } from './dto/update-parent-self-body.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users/me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersMeProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Get logged-in parent profile' })
  @ApiResponse({ status: 200, description: 'Parent user document' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  findProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findParentSelf(userId);
  }

  @Patch('profile')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Update logged-in parent profile (not email or status)' })
  @ApiResponse({ status: 200, description: 'Updated parent user' })
  @ApiResponse({ status: 404, description: 'Parent not found' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(UpdateParentSelfSchema)) dto: UpdateParentSelfBodyDto
  ) {
    return this.usersService.updateParentSelf(userId, dto);
  }
}
