import { Document } from 'mongoose';
export type CodeDocument = Code & Document;
export declare enum CodeType {
    DISCOUNT = "DISCOUNT",
    PROMO = "PROMO",
    REFERRAL = "REFERRAL"
}
export declare enum CodeStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    EXPIRED = "EXPIRED"
}
export declare class Code {
    code: string;
    type: CodeType;
    discountPercentage?: number;
    discountAmount?: number;
    status: CodeStatus;
    expiryDate?: Date;
    usageLimit: number;
    usageCount: number;
    description?: string;
}
export declare const CodeSchema: import("mongoose").Schema<Code, import("mongoose").Model<Code, any, any, any, Document<unknown, any, Code, any, {}> & Code & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Code, Document<unknown, {}, import("mongoose").FlatRecord<Code>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Code> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
