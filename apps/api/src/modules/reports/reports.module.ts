import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report, ReportSchema } from '../../infra/database/schemas/report.schema';
import { AuditModule } from '../audit/audit.module';
import { SessionsModule } from '../sessions/sessions.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { KidsModule } from '../kids/kids.module';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { Session, SessionSchema } from '../../infra/database/schemas/session.schema';
import { Invoice, InvoiceSchema } from '../../infra/database/schemas/invoice.schema';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import { Location, LocationSchema } from '../../infra/database/schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Report.name, schema: ReportSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Kid.name, schema: KidSchema },
      { name: Location.name, schema: LocationSchema },
    ]),
    AuditModule,
    SessionsModule,
    InvoicesModule,
    KidsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
