import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/infra/database/schemas/user.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const authService = app.get(AuthService);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@growfitness.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = await userModel.findOne({ email: adminEmail }).exec();

  if (existingAdmin) {
    console.log('Admin user already exists');
    await app.close();
    return;
  }

  const passwordHash = await authService.hashPassword(adminPassword);

  const admin = new userModel({
    role: UserRole.ADMIN,
    email: adminEmail,
    phone: '+1234567890',
    passwordHash,
    status: UserStatus.ACTIVE,
  });

  await admin.save();

  console.log('Admin user created successfully!');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);

  await app.close();
}

bootstrap().catch((error) => {
  console.error('Error seeding admin:', error);
  process.exit(1);
});

