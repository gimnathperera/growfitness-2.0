import { Allow } from 'class-validator';

/**
 * Whitelist DTO for POST /users/coaches body.
 * Global ValidationPipe with forbidNonWhitelisted rejects bodies when the param type
 * is a Zod-inferred interface (Object at runtime). This class explicitly whitelists
 * all coach fields so the body passes before ZodValidationPipe runs.
 */
export class CreateCoachBodyDto {
  @Allow()
  name!: string;

  @Allow()
  email!: string;

  @Allow()
  phone!: string;

  @Allow()
  password!: string;

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
  employmentType?: string;

  @Allow()
  cvUrl?: string;
}
