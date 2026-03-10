import { Document, Types } from 'mongoose';
import { SessionType, RequestStatus } from '@grow-fitness/shared-types';
export type ExtraSessionRequestDocument = ExtraSessionRequest & Document;
export declare class ExtraSessionRequest {
    parentId: Types.ObjectId;
    kidId: Types.ObjectId;
    coachId: Types.ObjectId;
    sessionType: SessionType;
    locationId: Types.ObjectId;
    preferredDateTime: Date;
    status: RequestStatus;
}
export declare const ExtraSessionRequestSchema: import("mongoose").Schema<ExtraSessionRequest, import("mongoose").Model<ExtraSessionRequest, any, any, any, Document<unknown, any, ExtraSessionRequest, any, {}> & ExtraSessionRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ExtraSessionRequest, Document<unknown, {}, import("mongoose").FlatRecord<ExtraSessionRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ExtraSessionRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
