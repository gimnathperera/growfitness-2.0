import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

/**
 * Development script to approve all existing parents and kids in the database
 * WARNING: This is for development use only!
 */
async function approveAllUsers() {
  // Get MongoDB connection string from environment
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grow-fitness';
  
  try {
    console.log('\n🔄 Connecting to database...\n');
    
    // Connect directly to MongoDB without NestJS
    await mongoose.connect(mongoUri);
    console.log('   ✓ Connected to database\n');
    
    console.log('🔄 Starting approval of all parents and kids...\n');

    // Get collections directly
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const usersCollection = db.collection('users');
    const kidsCollection = db.collection('kids');

    // Approve all parents
    const parentResult = await usersCollection.updateMany(
      { role: 'PARENT' },
      { $set: { isApproved: true } }
    );

    console.log(`   ✓ Approved ${parentResult.modifiedCount} parents`);

    // Approve all kids
    const kidResult = await kidsCollection.updateMany(
      {},
      { $set: { isApproved: true } }
    );

    console.log(`   ✓ Approved ${kidResult.modifiedCount} kids`);

    console.log('\n✅ Approval completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - ${parentResult.modifiedCount} parents approved`);
    console.log(`   - ${kidResult.modifiedCount} kids approved\n`);

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
