import { Document, Types } from 'mongoose';
import { RequestStatus } from '@grow-fitness/shared-types';
export type UserRegistrationRequestDocument = UserRegistrationRequest & Document;
export declare class UserRegistrationRequest {
    parentId: Types.ObjectId;
    status: RequestStatus;
    processedAt?: Date;
    processedBy?: Types.ObjectId;
}
export declare const UserRegistrationRequestSchema: import("mongoose").Schema<UserRegistrationRequest, import("mongoose").Model<UserRegistrationRequest, any, any, any, Document<unknown, any, UserRegistrationRequest, any, {}> & UserRegistrationRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserRegistrationRequest, Document<unknown, {}, import("mongoose").FlatRecord<UserRegistrationRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<UserRegistrationRequest> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
