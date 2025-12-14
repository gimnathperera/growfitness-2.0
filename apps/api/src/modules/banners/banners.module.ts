import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Banner, BannerSchema } from '../../infra/database/schemas/banner.schema';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]), AuditModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}

