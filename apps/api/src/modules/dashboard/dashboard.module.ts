import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SessionsModule } from '../sessions/sessions.module';
import { RequestsModule } from '../requests/requests.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SessionsModule, RequestsModule, InvoicesModule, AuditModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

