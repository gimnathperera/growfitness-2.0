import { Document } from 'mongoose';
export type TestimonialDocument = Testimonial & Document;
export declare class Testimonial {
    authorName: string;
    content: string;
    childName?: string;
    childAge?: number;
    membershipDuration?: string;
    rating?: number;
    order?: number;
    isActive?: boolean;
}
export declare const TestimonialSchema: import("mongoose").Schema<Testimonial, import("mongoose").Model<Testimonial, any, any, any, Document<unknown, any, Testimonial, any, {}> & Testimonial & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Testimonial, Document<unknown, {}, import("mongoose").FlatRecord<Testimonial>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Testimonial> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
