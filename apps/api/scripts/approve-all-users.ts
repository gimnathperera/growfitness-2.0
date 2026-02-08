import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

/**
 * One-time script to set isApproved: true for all existing users and kids.
 * Run once to ensure everyone created up to now can log in after the approval check was added.
 *
 * Usage: pnpm run approve-all (from apps/api)
 */
async function approveAllUsers() {
  // Get MongoDB connection string from environment
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grow-fitness';

  try {
    console.log('\n🔄 Connecting to database...\n');

    // Connect directly to MongoDB without NestJS
    await mongoose.connect(mongoUri);
    console.log('   ✓ Connected to database\n');

    console.log('🔄 Setting isApproved: true for all existing users and kids...\n');

    // Get collections directly
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const usersCollection = db.collection('users');
    const kidsCollection = db.collection('kids');

    // Approve all users (any role: PARENT, COACH, ADMIN)
    const userResult = await usersCollection.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } }
    );

    console.log(`   ✓ Approved ${userResult.modifiedCount} users`);

    // Approve all kids
    const kidResult = await kidsCollection.updateMany(
      { isApproved: { $ne: true } },
      { $set: { isApproved: true } }
    );

    console.log(`   ✓ Approved ${kidResult.modifiedCount} kids`);

    console.log('\n✅ Approval completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - ${userResult.modifiedCount} users set to approved`);
    console.log(`   - ${kidResult.modifiedCount} kids set to approved\n`);

    await mongoose.disconnect();
    console.log('   ✓ Disconnected from database\n');
  } catch (error) {
    console.error('\n❌ Error during approval:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

approveAllUsers().catch(error => {
  console.error('Failed to run approval script:', error);
  process.exit(1);
});
