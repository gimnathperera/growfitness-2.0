import { Document, Types } from 'mongoose';
import { SessionType } from '@grow-fitness/shared-types';
export type KidDocument = Kid & Document;
export declare class Kid {
    parentId: Types.ObjectId;
    name: string;
    gender: string;
    birthDate: Date;
    goal?: string;
    currentlyInSports: boolean;
    medicalConditions: string[];
    sessionType: SessionType;
    achievements?: Types.ObjectId[];
    milestones?: Types.ObjectId[];
    isApproved: boolean;
}
export declare const KidSchema: import("mongoose").Schema<Kid, import("mongoose").Model<Kid, any, any, any, Document<unknown, any, Kid, any, {}> & Kid & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Kid, Document<unknown, {}, import("mongoose").FlatRecord<Kid>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Kid> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
