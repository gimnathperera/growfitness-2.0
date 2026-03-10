import { Document, Types } from 'mongoose';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
export type InvoiceDocument = Invoice & Document;
export declare class Invoice {
    type: InvoiceType;
    parentId?: Types.ObjectId;
    coachId?: Types.ObjectId;
    items: Array<{
        description: string;
        amount: number;
    }>;
    totalAmount: number;
    status: InvoiceStatus;
    dueDate: Date;
    paidAt?: Date;
    exportFields?: Record<string, unknown>;
}
export declare const InvoiceSchema: import("mongoose").Schema<Invoice, import("mongoose").Model<Invoice, any, any, any, Document<unknown, any, Invoice, any, {}> & Invoice & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Invoice, Document<unknown, {}, import("mongoose").FlatRecord<Invoice>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Invoice> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
