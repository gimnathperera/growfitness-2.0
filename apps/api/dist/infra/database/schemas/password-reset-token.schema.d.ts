import { Document, Types } from 'mongoose';
export type PasswordResetTokenDocument = PasswordResetToken & Document;
export declare class PasswordResetToken {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
    used: boolean;
}
export declare const PasswordResetTokenSchema: import("mongoose").Schema<PasswordResetToken, import("mongoose").Model<PasswordResetToken, any, any, any, Document<unknown, any, PasswordResetToken, any, {}> & PasswordResetToken & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PasswordResetToken, Document<unknown, {}, import("mongoose").FlatRecord<PasswordResetToken>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PasswordResetToken> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
