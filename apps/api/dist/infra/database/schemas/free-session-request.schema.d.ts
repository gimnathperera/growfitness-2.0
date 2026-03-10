import { Document, Types } from 'mongoose';
import { SessionType, RequestStatus } from '@grow-fitness/shared-types';
export type FreeSessionRequestDocument = FreeSessionRequest & Document;
export declare class FreeSessionRequest {
    parentName: string;
    phone: string;
    email: string;
    kidName: string;
    sessionType: SessionType;
    selectedSessionId?: Types.ObjectId;
    preferredDateTime?: Date;
    locationId?: Types.ObjectId;
    status: RequestStatus;
}
export declare const FreeSessionRequestSchema: import("mongoose").Schema<FreeSessionRequest, import("mongoose").Model<FreeSessionRequest, any, any, any, Document<unknown, any, FreeSessionRequest, any, {}> & FreeSessionRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FreeSessionRequest, Document<unknown, {}, import("mongoose").FlatRecord<FreeSessionRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<FreeSessionRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
