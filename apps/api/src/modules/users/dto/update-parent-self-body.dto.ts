import { Allow } from 'class-validator';

/** Whitelist body for PATCH /users/me/profile before Zod validation. */
export class UpdateParentSelfBodyDto {
  @Allow()
  name?: string;

  @Allow()
  phone?: string;

  @Allow()
  location?: string;

  @Allow()
  photoUrl?: string;
}
