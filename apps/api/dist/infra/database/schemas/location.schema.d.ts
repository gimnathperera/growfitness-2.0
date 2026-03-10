import { Document } from 'mongoose';
export type LocationDocument = Location & Document;
export declare class Location {
    name: string;
    address: string;
    placeUrl?: string;
    geo?: {
        lat: number;
        lng: number;
    };
    isActive: boolean;
}
export declare const LocationSchema: import("mongoose").Schema<Location, import("mongoose").Model<Location, any, any, any, Document<unknown, any, Location, any, {}> & Location & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Location, Document<unknown, {}, import("mongoose").FlatRecord<Location>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Location> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
