import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { Session, SessionSchema } from '../../infra/database/schemas/session.schema';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import {
  GoogleCalendarEvent,
  GoogleCalendarEventSchema,
} from '../../infra/database/schemas/google-calendar-event.schema';
import { GoogleOAuthStateService } from './google-oauth-state.service';
import { GoogleCalendarOAuthService } from './google-calendar-oauth.service';
import { GoogleCalendarApiService } from './google-calendar-api.service';
import { GoogleCalendarSyncService } from './google-calendar-sync.service';
import { GoogleCalendarAuthController } from './google-calendar-auth.controller';
import { GoogleCalendarStatusController } from './google-calendar-status.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Kid.name, schema: KidSchema },
      { name: GoogleCalendarEvent.name, schema: GoogleCalendarEventSchema },
    ]),
  ],
  controllers: [GoogleCalendarAuthController, GoogleCalendarStatusController],
  providers: [
    GoogleOAuthStateService,
    GoogleCalendarOAuthService,
    GoogleCalendarApiService,
    GoogleCalendarSyncService,
  ],
  exports: [GoogleCalendarSyncService],
})
export class GoogleCalendarModule {}

