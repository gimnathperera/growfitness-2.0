import { Document } from 'mongoose';
import { BannerTargetAudience } from '@grow-fitness/shared-types';
export type BannerDocument = Banner & Document;
export declare class Banner {
    imageUrl: string;
    active: boolean;
    order: number;
    targetAudience: BannerTargetAudience;
}
export declare const BannerSchema: import("mongoose").Schema<Banner, import("mongoose").Model<Banner, any, any, any, Document<unknown, any, Banner, any, {}> & Banner & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Banner, Document<unknown, {}, import("mongoose").FlatRecord<Banner>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Banner> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
