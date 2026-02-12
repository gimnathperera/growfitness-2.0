import { Allow } from 'class-validator';

/**
 * Whitelist DTO for POST /testimonials body.
 * Global ValidationPipe with forbidNonWhitelisted rejects bodies when the param type
 * is a Zod-inferred interface (Object at runtime). This class explicitly whitelists
 * all testimonial fields so the body passes before ZodValidationPipe runs.
 */
export class CreateTestimonialBodyDto {
  @Allow()
  authorName!: string;

  @Allow()
  content!: string;

  @Allow()
  childName?: string;

  @Allow()
  childAge?: number;

  @Allow()
  membershipDuration?: string;

  @Allow()
  rating?: number;

  @Allow()
  order?: number;

  @Allow()
  isActive?: boolean;
}
