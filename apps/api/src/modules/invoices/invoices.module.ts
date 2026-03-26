import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesController } from './invoices.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from '../../infra/database/schemas/invoice.schema';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
