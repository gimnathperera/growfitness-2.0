import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Kid, KidSchema } from '../../infra/database/schemas/kid.schema';
import { User, UserSchema } from '../../infra/database/schemas/user.schema';
import { Banner, BannerSchema } from '../../infra/database/schemas/banner.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kid.name, schema: KidSchema },
      { name: User.name, schema: UserSchema },
      { name: Banner.name, schema: BannerSchema },
    ]),
    AuditModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
