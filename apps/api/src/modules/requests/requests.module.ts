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
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FreeSessionRequest.name, schema: FreeSessionRequestSchema },
      { name: RescheduleRequest.name, schema: RescheduleRequestSchema },
      { name: ExtraSessionRequest.name, schema: ExtraSessionRequestSchema },
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}

