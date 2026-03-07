import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Session, SessionSchema } from '../../infra/database/schemas/session.schema';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Kid.name, schema: KidSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
    NotificationsModule,
    GoogleCalendarModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
