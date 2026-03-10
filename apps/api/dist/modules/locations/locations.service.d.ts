import { Model } from 'mongoose';
import { Location, LocationDocument } from '../../infra/database/schemas/location.schema';
import { CreateLocationDto, UpdateLocationDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class LocationsService {
    private locationModel;
    private auditService;
    constructor(locationModel: Model<LocationDocument>, auditService: AuditService);
    findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<import("mongoose").Document<unknown, {}, LocationDocument, {}, {}> & Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, LocationDocument, {}, {}> & Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createLocationDto: CreateLocationDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, LocationDocument, {}, {}> & Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateLocationDto: UpdateLocationDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, LocationDocument, {}, {}> & Location & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
