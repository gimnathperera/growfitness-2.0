/**
 * One-time script to set placeUrl for all existing locations that don't have one.
 * - If a location has geo (lat/lng), sets placeUrl to a Google Maps link.
 * - Otherwise sets placeUrl to empty string so the field exists.
 *
 * Uses MongoDB directly (no Nest/AppModule) to avoid ESM/CommonJS conflicts.
 *
 * Run from apps/api: pnpm run backfill-place-urls
 * Requires MONGODB_URI in environment or in apps/api/.env
 */
import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv(): void {
  const dir = resolve(__dirname, '..');
  for (const file of ['.env.local', '.env']) {
    const path = resolve(dir, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^\s*MONGODB_URI\s*=\s*(.+)$/);
        if (match && !process.env.MONGODB_URI) {
          process.env.MONGODB_URI = match[1].trim().replace(/^["']|["']$/g, '');
        }
      }
      break;
    }
  }
}
loadEnv();

function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

async function backfillPlaceUrls() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/grow-fitness';

  try {
    console.log('\n📍 Connecting to database...\n');
    await mongoose.connect(mongoUri);

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const locationsCollection = db.collection('locations');
    const locations = await locationsCollection.find({}).toArray();

    console.log(`   Found ${locations.length} location(s).\n`);

    let updated = 0;
    let skipped = 0;

    for (const loc of locations) {
      const id = loc._id.toString();
      const name = loc.name ?? '(no name)';
      const existingPlaceUrl = loc.placeUrl;
      const geo = loc.geo;

      if (existingPlaceUrl && String(existingPlaceUrl).trim() !== '') {
        console.log(`   Skip "${name}" (id: ${id}) – already has placeUrl`);
        skipped++;
        continue;
      }

      const newPlaceUrl =
        geo?.lat != null && geo?.lng != null
          ? googleMapsUrl(Number(geo.lat), Number(geo.lng))
          : '';

      await locationsCollection.updateOne(
        { _id: loc._id },
        { $set: { placeUrl: newPlaceUrl } }
      );

      console.log(`   Updated "${name}" (id: ${id}) – placeUrl: ${newPlaceUrl || '(empty)'}`);
      updated++;
    }

    console.log(`\n   Done. Updated: ${updated}, Skipped: ${skipped}\n`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
    console.log('   Disconnected from database.\n');
  }
}

backfillPlaceUrls();
