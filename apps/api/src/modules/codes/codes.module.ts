import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodesController } from './codes.controller';
import { CodesService } from './codes.service';
import { Code, CodeSchema } from '../../infra/database/schemas/code.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]), AuditModule],
  controllers: [CodesController],
  providers: [CodesService],
  exports: [CodesService],
})
export class CodesModule {}

