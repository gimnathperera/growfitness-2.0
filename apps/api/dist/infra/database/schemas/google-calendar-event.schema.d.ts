import { Document, Types } from 'mongoose';
export type GoogleCalendarEventDocument = GoogleCalendarEvent & Document;
export declare class GoogleCalendarEvent {
    userId: Types.ObjectId;
    sessionId: Types.ObjectId;
    googleEventId: string;
}
export declare const GoogleCalendarEventSchema: import("mongoose").Schema<GoogleCalendarEvent, import("mongoose").Model<GoogleCalendarEvent, any, any, any, Document<unknown, any, GoogleCalendarEvent, any, {}> & GoogleCalendarEvent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GoogleCalendarEvent, Document<unknown, {}, import("mongoose").FlatRecord<GoogleCalendarEvent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GoogleCalendarEvent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
