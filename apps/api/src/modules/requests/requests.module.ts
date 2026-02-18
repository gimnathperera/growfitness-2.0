import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import {
  FreeSessionRequest,
  FreeSessionRequestSchema,
} from '../../infra/database/schemas/free-session-request.schema';
import {
  RescheduleRequest,
  RescheduleRequestSchema,
} from '../../infra/database/schemas/reschedule-request.schema';
import {
  ExtraSessionRequest,
  ExtraSessionRequestSchema,
} from '../../infra/database/schemas/extra-session-request.schema';
import {
  UserRegistrationRequest,
  UserRegistrationRequestSchema,
} from '../../infra/database/schemas/user-registration-request.schema';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import { Session, SessionSchema } from '../../infra/database/schemas/session.schema';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FreeSessionRequest.name, schema: FreeSessionRequestSchema },
      { name: RescheduleRequest.name, schema: RescheduleRequestSchema },
      { name: ExtraSessionRequest.name, schema: ExtraSessionRequestSchema },
      { name: UserRegistrationRequest.name, schema: UserRegistrationRequestSchema },
      { name: User.name, schema: UserSchema },
      { name: Kid.name, schema: KidSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
