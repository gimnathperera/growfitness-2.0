import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, type: String, enum: InvoiceType })
  type: InvoiceType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  parentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  coachId?: Types.ObjectId;

  @Prop({
    type: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    required: true,
  })
  items: Array<{
    description: string;
    amount: number;
  }>;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, type: String, enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: false })
  paidAt?: Date;

  @Prop({ type: Object, required: false })
  exportFields?: Record<string, unknown>;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ type: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ parentId: 1 });
InvoiceSchema.index({ coachId: 1 });
