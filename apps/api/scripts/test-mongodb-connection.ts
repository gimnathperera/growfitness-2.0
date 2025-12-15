/**
 * MongoDB Connection Test Script
 *
 * This script tests the MongoDB connection and provides diagnostic information.
 * Run with: pnpm ts-node -r tsconfig-paths/register scripts/test-mongodb-connection.ts
 */

import * as mongoose from 'mongoose';
import * as dns from 'dns';
import * as util from 'util';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dnsLookup = util.promisify(dns.lookup);
const dnsResolveSrv = util.promisify(dns.resolveSrv);

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grow-fitness';

  console.log('\n🔍 MongoDB Connection Diagnostics\n');
  console.log('='.repeat(50));

  // Extract hostname from URI
  const uriMatch =
    uri.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/) || uri.match(/mongodb:\/\/[^@]*@?([^\/:]+)/);
  const hostname = uriMatch ? uriMatch[1] : 'unknown';

  console.log(`\n📋 Connection Details:`);
  console.log(`   URI (masked): ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  console.log(`   Hostname: ${hostname}`);

  // Test DNS resolution
  console.log(`\n🌐 DNS Resolution Test:`);
  try {
    if (uri.startsWith('mongodb+srv://')) {
      const srvHost = `_mongodb._tcp.${hostname}`;
      console.log(`   Testing SRV record: ${srvHost}`);
      try {
        const srvRecords = await dnsResolveSrv(srvHost);
        console.log(`   ✅ SRV record found:`, srvRecords);
      } catch (srvError: any) {
        console.log(`   ❌ SRV record not found: ${srvError.message}`);
        console.log(`   💡 This usually means:`);
        console.log(`      - The MongoDB Atlas cluster doesn't exist`);
        console.log(`      - The cluster name is incorrect`);
        console.log(`      - The cluster was deleted or renamed`);
        console.log(`      - Network/DNS issues`);
      }
    }

    console.log(`   Testing hostname resolution: ${hostname}`);
    try {
      const addresses = await dnsLookup(hostname);
      console.log(`   ✅ Hostname resolves to:`, addresses);
    } catch (lookupError: any) {
      console.log(`   ❌ Hostname resolution failed: ${lookupError.message}`);
    }
  } catch (error: any) {
    console.log(`   ❌ DNS test failed: ${error.message}`);
  }

  // Test MongoDB connection
  console.log(`\n🔌 MongoDB Connection Test:`);
  try {
    console.log(`   Attempting to connect...`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`   ✅ Successfully connected to MongoDB!`);
    console.log(`   Database: ${mongoose.connection.db?.databaseName}`);
    console.log(`   Ready state: ${mongoose.connection.readyState}`);

    // Test a simple query
    const adminDb = mongoose.connection.db?.admin();
    if (adminDb) {
      const serverStatus = await adminDb.ping();
      console.log(`   ✅ Server ping successful:`, serverStatus);
    }

    await mongoose.disconnect();
    console.log(`   ✅ Disconnected successfully`);
  } catch (error: any) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    console.log(`\n💡 Troubleshooting Tips:`);
    console.log(`   1. Verify your MongoDB Atlas cluster exists and is running`);
    console.log(`   2. Check your connection string in .env file`);
    console.log(`   3. Ensure your IP address is whitelisted in MongoDB Atlas`);
    console.log(`   4. Verify your database user credentials`);
    console.log(`   5. Check your network connection`);
    console.log(`   6. Try connecting from MongoDB Atlas dashboard to verify cluster status`);

    if (error.message.includes('ENOTFOUND')) {
      console.log(`\n   ⚠️  DNS Error Detected:`);
      console.log(`      The hostname "${hostname}" cannot be resolved.`);
      console.log(`      Please verify the cluster name in your MongoDB Atlas dashboard.`);
    }

    process.exit(1);
  }

  console.log(`\n${'='.repeat(50)}\n`);
}

// Run the test
testConnection().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
