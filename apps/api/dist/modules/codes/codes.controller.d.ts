import { CodesService, CreateCodeDto, UpdateCodeDto } from './codes.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class CodesController {
    private readonly codesService;
    constructor(codesService: CodesService);
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").CodeDocument, {}, {}> & import("../../infra/database/schemas").Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").CodeDocument, {}, {}> & import("../../infra/database/schemas").Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(createCodeDto: CreateCodeDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").CodeDocument, {}, {}> & import("../../infra/database/schemas").Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, updateCodeDto: UpdateCodeDto, actorId: string): Promise<import("mongoose").Document<unknown, {}, import("../../infra/database/schemas").CodeDocument, {}, {}> & import("../../infra/database/schemas").Code & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
}
