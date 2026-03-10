import { Document } from 'mongoose';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
export type UserDocument = User & Document;
export declare class User {
    role: UserRole;
    email: string;
    phone: string;
    passwordHash: string;
    status: UserStatus;
    isApproved: boolean;
    parentProfile?: {
        name: string;
        location?: string;
    };
    coachProfile?: {
        name: string;
    };
    googleCalendarRefreshToken?: string;
    googleCalendarConnectedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
