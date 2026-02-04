import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import {
  UserRegistrationRequest,
  UserRegistrationRequestSchema,
} from '../../infra/database/schemas/user-registration-request.schema';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Kid.name, schema: KidSchema },
      { name: UserRegistrationRequest.name, schema: UserRegistrationRequestSchema },
    ]),
    AuthModule,
    AuditModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
