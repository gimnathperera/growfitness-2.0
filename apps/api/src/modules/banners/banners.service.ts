import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from '../../infra/database/schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    private auditService: AuditService
  ) {}

  async findAll(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;
    const [data, total] = await Promise.all([
      this.bannerModel.find().sort({ order: 1 }).skip(skip).limit(pagination.limit).exec(),
      this.bannerModel.countDocuments().exec(),
    ]);

    return new PaginatedResponseDto(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string) {
    const banner = await this.bannerModel.findById(id).exec();

    if (!banner) {
      throw new NotFoundException({
        errorCode: ErrorCode.BANNER_NOT_FOUND,
        message: 'Banner not found',
      });
    }

    return banner;
  }

  async create(createBannerDto: CreateBannerDto, actorId: string) {
    const banner = new this.bannerModel(createBannerDto);
    await banner.save();

    await this.auditService.log({
      actorId,
      action: 'CREATE_BANNER',
      entityType: 'Banner',
      entityId: banner._id.toString(),
      metadata: createBannerDto,
    });

    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto, actorId: string) {
    const banner = await this.bannerModel.findById(id).exec();

    if (!banner) {
      throw new NotFoundException({
        errorCode: ErrorCode.BANNER_NOT_FOUND,
        message: 'Banner not found',
      });
    }

    Object.assign(banner, updateBannerDto);
    await banner.save();

    await this.auditService.log({
      actorId,
      action: 'UPDATE_BANNER',
      entityType: 'Banner',
      entityId: id,
      metadata: updateBannerDto,
    });

    return banner;
  }

  async delete(id: string, actorId: string) {
    const banner = await this.bannerModel.findById(id).exec();

    if (!banner) {
      throw new NotFoundException({
        errorCode: ErrorCode.BANNER_NOT_FOUND,
        message: 'Banner not found',
      });
    }

    await this.bannerModel.deleteOne({ _id: id }).exec();

    await this.auditService.log({
      actorId,
      action: 'DELETE_BANNER',
      entityType: 'Banner',
      entityId: id,
    });

    return { message: 'Banner deleted successfully' };
  }

  async reorder(reorderDto: ReorderBannersDto, actorId: string) {
    const updates = reorderDto.bannerIds.map((bannerId, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(bannerId) },
        update: { $set: { order: index } },
      },
    }));

    await this.bannerModel.bulkWrite(updates);

    await this.auditService.log({
      actorId,
      action: 'REORDER_BANNERS',
      entityType: 'Banner',
      entityId: 'multiple',
      metadata: reorderDto,
    });

    return { message: 'Banners reordered successfully' };
  }
}
