import { Document, Types } from 'mongoose';
import { RequestStatus } from '@grow-fitness/shared-types';
export type RescheduleRequestDocument = RescheduleRequest & Document;
export declare class RescheduleRequest {
    sessionId: Types.ObjectId;
    requestedBy: Types.ObjectId;
    newDateTime: Date;
    reason: string;
    status: RequestStatus;
    processedAt?: Date;
}
export declare const RescheduleRequestSchema: import("mongoose").Schema<RescheduleRequest, import("mongoose").Model<RescheduleRequest, any, any, any, Document<unknown, any, RescheduleRequest, any, {}> & RescheduleRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RescheduleRequest, Document<unknown, {}, import("mongoose").FlatRecord<RescheduleRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RescheduleRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
