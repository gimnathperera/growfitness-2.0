import { Allow } from 'class-validator';
import { EmploymentType, UserStatus } from '@grow-fitness/shared-types';

/**
 * Whitelist DTO for PATCH /users/coaches/:id body.
 * Keeps global ValidationPipe from stripping coach profile fields before Zod runs.
 */
export class UpdateCoachBodyDto {
  @Allow()
  name?: string;

  @Allow()
  email?: string;

  @Allow()
  phone?: string;

  @Allow()
  status?: UserStatus.ACTIVE | UserStatus.INACTIVE;

  @Allow()
  dateOfBirth?: string;

  @Allow()
  photoUrl?: string;

  @Allow()
  homeAddress?: string;

  @Allow()
  school?: string;

  @Allow()
  availableTimes?: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;

  @Allow()
  employmentType?: EmploymentType;

  @Allow()
  cvUrl?: string;
}
