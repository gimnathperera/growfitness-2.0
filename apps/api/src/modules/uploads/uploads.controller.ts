import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@grow-fitness/shared-types';
import {
  UploadPresignSchema,
  UploadFinalizeSchema,
  UploadPresignDto,
  UploadFinalizeDto,
} from '@grow-fitness/shared-schemas';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { JwtPayload } from '../auth/auth.service';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth('JWT-auth')
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  @ApiOperation({ summary: 'Get a short-lived signed URL to upload a file directly to GCS' })
  presign(
    @Body(new ZodValidationPipe(UploadPresignSchema)) body: UploadPresignDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.uploadsService.presign(body, user);
  }

  @Post('finalize')
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  @ApiOperation({ summary: 'Persist uploaded file URL on kid or coach after GCS upload completes' })
  finalize(
    @Body(new ZodValidationPipe(UploadFinalizeSchema)) body: UploadFinalizeDto,
    @CurrentUser() user: JwtPayload
  ) {
    return this.uploadsService.finalize(body, user);
  }
}
