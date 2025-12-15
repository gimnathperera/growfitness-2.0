import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmContact, CrmContactSchema } from '../../infra/database/schemas/crm-contact.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: CrmContact.name, schema: CrmContactSchema }]), AuditModule],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}

