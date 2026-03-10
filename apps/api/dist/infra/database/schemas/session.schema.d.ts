import { Document, Types } from 'mongoose';
import { SessionType, SessionStatus } from '@grow-fitness/shared-types';
export type SessionDocument = Session & Document;
export declare class Session {
    title: string;
    type: SessionType;
    coachId: Types.ObjectId;
    locationId: Types.ObjectId;
    dateTime: Date;
    duration: number;
    capacity: number;
    kids?: Types.ObjectId[];
    status: SessionStatus;
    isFreeSession: boolean;
}
export declare const SessionSchema: import("mongoose").Schema<Session, import("mongoose").Model<Session, any, any, any, Document<unknown, any, Session, any, {}> & Session & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Session, Document<unknown, {}, import("mongoose").FlatRecord<Session>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Session> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
