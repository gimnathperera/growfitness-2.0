import * as readline from 'readline';
import { NestFactory } from '@nestjs/core';
import type { INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../src/infra/database/schemas/user.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';

interface AdminInputs {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

function questionPassword(query: string): Promise<string> {
  return new Promise(resolve => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(query);

    // Temporarily close stdin to take control
    const wasRaw = stdin.isRaw || false;
    const wasPaused = stdin.isPaused();

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const cleanup = () => {
      if (stdin.isTTY) {
        stdin.setRawMode(wasRaw);
      }
      if (wasPaused) {
        stdin.pause();
      }
      stdin.removeListener('data', onData);
    };

    const onData = (char: string) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D (EOF)
          cleanup();
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          cleanup();
          stdout.write('\n');
          process.exit(0);
          break;
        case '\u007f': // Backspace (Delete)
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          // Only accept printable characters (skip control characters)
          // eslint-disable-next-line no-case-declarations
          const code = char.charCodeAt(0);
          if (code >= 32 && code !== 127) {
            password += char;
            stdout.write('*');
          }
          break;
      }
    };

    stdin.on('data', onData);
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}

async function collectInputs(): Promise<AdminInputs> {
  console.log('\n');
  console.log('Creating admin user');
  console.log('--------------------');

  let email = '';
  let name = '';
  let password = '';
  let confirmPassword = '';

  // Email
  const rlEmail = createReadlineInterface();
  try {
    while (!email) {
      const input = await question(rlEmail, 'Insert your email address: ');
      const trimmed = input.trim();
      if (!trimmed) {
        console.log('❌ Email is required');
        continue;
      }
      if (!validateEmail(trimmed)) {
        console.log('❌ Invalid email format');
        continue;
      }
      email = trimmed.toLowerCase();
    }
  } finally {
    rlEmail.close();
  }

  // Name
  const rlName = createReadlineInterface();
  try {
    while (!name) {
      const input = await question(rlName, 'Insert your full name: ');
      const trimmed = input.trim();
      if (!trimmed) {
        console.log('❌ Name is required');
        continue;
      }
      name = trimmed;
    }
  } finally {
    rlName.close();
  }

  // Password
  while (!password) {
    const input = await questionPassword('Insert your password: ');
    const trimmed = input.trim();
    if (!trimmed) {
      console.log('❌ Password is required');
      continue;
    }
    const validation = validatePassword(trimmed);
    if (!validation.valid) {
      console.log(`❌ ${validation.message}`);
      continue;
    }
    password = trimmed;
  }

  // Confirm Password
  while (!confirmPassword || confirmPassword !== password) {
    const input = await questionPassword('Insert your confirm password: ');
    const trimmed = input.trim();
    if (!trimmed) {
      console.log('❌ Password confirmation is required');
      continue;
    }
    if (trimmed !== password) {
      console.log('❌ Passwords do not match');
      continue;
    }
    confirmPassword = trimmed;
  }

  return { email, name, password, confirmPassword };
}

async function createAdmin() {
  let app: INestApplicationContext | undefined;

  try {
    // Collect user inputs
    const inputs = await collectInputs();

    console.log('\n🔄 Creating admin user...');

    // Initialize NestJS application context
    app = await NestFactory.createApplicationContext(AppModule);

    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const authService = app.get<AuthService>(AuthService);

    // Check if admin already exists
    const existingAdmin = await userModel
      .findOne({
        email: inputs.email,
        role: UserRole.ADMIN,
      })
      .exec();

    if (existingAdmin) {
      console.log('\n❌ Admin user with this email already exists');
      console.log('   Please use a different email address or update the existing user.');
      await app.close();
      process.exit(1);
    }

    // Hash password
    const passwordHash = await authService.hashPassword(inputs.password);

    // Create admin user
    const admin = new userModel({
      role: UserRole.ADMIN,
      email: inputs.email,
      phone: '+1234567890', // Default phone, can be updated later
      passwordHash,
      status: UserStatus.ACTIVE,
      isApproved: true,
      coachProfile: {
        name: inputs.name,
      },
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log(`   Email: ${inputs.email}`);
    console.log(`   Name: ${inputs.name}`);
    console.log('\n💡 You can now login with these credentials.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorCode = (error as { code?: number })?.code;

    console.error('\n❌ Error creating admin user:', errorMessage);
    if (errorCode === 11000) {
      console.error('   This email is already registered in the system.');
    }
    process.exit(1);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

createAdmin().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
