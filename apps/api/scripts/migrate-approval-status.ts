import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Kid, KidDocument } from '../src/infra/database/schemas';

/**
 * Migration script to set isApproved: true for all existing users and kids
 * This should be run once when deploying the parent registration approval feature
 */
async function migrateApprovalStatus() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const kidModel = app.get<Model<KidDocument>>(getModelToken(Kid.name));

  try {
    console.log('\n🔄 Starting approval status migration...\n');

    // Update all existing users to be approved
    const userResult = await userModel.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } }
    ).exec();

    console.log(`   ✓ Updated ${userResult.modifiedCount} users to approved status`);

    // Update all existing kids to be approved
    const kidResult = await kidModel.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } }
    ).exec();

    console.log(`   ✓ Updated ${kidResult.modifiedCount} kids to approved status`);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - ${userResult.modifiedCount} users approved`);
    console.log(`   - ${kidResult.modifiedCount} kids approved\n`);

    await app.close();
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    await app.close();
    process.exit(1);
  }
}

migrateApprovalStatus().catch(error => {
  console.error('Failed to run migration:', error);
  process.exit(1);
});
