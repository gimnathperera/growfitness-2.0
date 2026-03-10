import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from '../../infra/database/schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class BannersService {
    private bannerModel;
    private auditService;
    constructor(bannerModel: Model<BannerDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createBannerDto: CreateBannerDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateBannerDto: UpdateBannerDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, BannerDocument, {}, {}> & Banner & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    reorder(reorderDto: ReorderBannersDto, actorId: string): Promise<{
        message: string;
    }>;
}
