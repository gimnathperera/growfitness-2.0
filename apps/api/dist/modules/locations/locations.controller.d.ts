import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").LocationDocument, {}, {}> & import("../../infra/database/schemas").Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").LocationDocument, {}, {}> & import("../../infra/database/schemas").Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createLocationDto: CreateLocationDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").LocationDocument, {}, {}> & import("../../infra/database/schemas").Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").LocationDocument, {}, {}> & import("../../infra/database/schemas").Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
