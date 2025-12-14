import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KidsController } from './kids.controller';
import { KidsService } from './kids.service';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kid.name, schema: KidSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
  ],
  controllers: [KidsController],
  providers: [KidsService],
  exports: [KidsService],
})
export class KidsModule {}

