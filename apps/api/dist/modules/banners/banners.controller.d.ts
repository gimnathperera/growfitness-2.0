import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class BannersController {
    private readonly bannersService;
    constructor(bannersService: BannersService);
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").BannerDocument, {}, {}> & import("../../infra/database/schemas").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").BannerDocument, {}, {}> & import("../../infra/database/schemas").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createBannerDto: CreateBannerDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").BannerDocument, {}, {}> & import("../../infra/database/schemas").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateBannerDto: UpdateBannerDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").BannerDocument, {}, {}> & import("../../infra/database/schemas").Banner & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
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
