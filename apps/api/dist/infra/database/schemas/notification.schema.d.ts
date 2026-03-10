import { Document, Types } from 'mongoose';
import { NotificationType } from '@grow-fitness/shared-types';
export type NotificationDocument = Notification & Document;
export declare class Notification {
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    entityType?: string;
    entityId?: string;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
