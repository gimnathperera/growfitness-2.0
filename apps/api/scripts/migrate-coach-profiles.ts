/**
 * One-off migration: ensure existing coach users have the extended coachProfile shape
 * (availableTimes, etc.) so UIs and API do not break. Run once after deploying
 * coach profile fields. Safe to run multiple times (idempotent).
 *
 * Usage: npx ts-node -r tsconfig-paths/register apps/api/scripts/migrate-coach-profiles.ts
 * Or from apps/api: pnpm exec ts-node -r tsconfig-paths/register scripts/migrate-coach-profiles.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/infra/database/schemas';
import { UserRole } from '@grow-fitness/shared-types';

async function migrateCoachProfiles() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  try {
    const coaches = await userModel
      .find({ role: UserRole.COACH })
      .lean()
      .exec();

    console.log(`Found ${coaches.length} coach(es).`);

    let updated = 0;
    for (const coach of coaches) {
      const profile = (coach as { coachProfile?: Record<string, unknown> }).coachProfile;
      const email = (coach as { email?: string }).email;
      const existingName = profile && typeof profile.name === 'string' ? profile.name : email?.split('@')[0] ?? 'Coach';

      const fullProfile = {
        name: existingName,
        dateOfBirth: profile?.dateOfBirth !== undefined ? profile.dateOfBirth : null,
        photoUrl: profile?.photoUrl !== undefined ? profile.photoUrl : null,
        homeAddress: profile?.homeAddress !== undefined ? profile.homeAddress : null,
        school: profile?.school !== undefined ? profile.school : null,
        availableTimes: Array.isArray(profile?.availableTimes) ? profile.availableTimes : [],
        employmentType: profile?.employmentType !== undefined ? profile.employmentType : null,
        cvUrl: profile?.cvUrl !== undefined ? profile.cvUrl : null,
      };

      if (!profile) {
        await userModel
          .updateOne({ _id: coach._id }, { $set: { coachProfile: fullProfile } })
          .exec();
        updated++;
      } else {
        const hasMissing =
          profile.dateOfBirth === undefined ||
          profile.photoUrl === undefined ||
          profile.homeAddress === undefined ||
          profile.school === undefined ||
          !Array.isArray(profile.availableTimes) ||
          profile.employmentType === undefined ||
          profile.cvUrl === undefined;
        if (hasMissing) {
          await userModel
            .updateOne({ _id: coach._id }, { $set: { coachProfile: fullProfile } })
            .exec();
          updated++;
        }
      }
    }

    console.log(`Updated ${updated} coach profile(s).`);
    await app.close();
  } catch (error) {
    console.error('Migration failed:', error);
    await app.close();
    process.exit(1);
  }
}

migrateCoachProfiles().catch((err) => {
  console.error(err);
  process.exit(1);
});
