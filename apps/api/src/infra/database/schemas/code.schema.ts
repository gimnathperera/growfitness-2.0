import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CodeDocument = Code & Document;

export enum CodeType {
  DISCOUNT = 'DISCOUNT',
  PROMO = 'PROMO',
  REFERRAL = 'REFERRAL',
}

export enum CodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true })
export class Code {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, type: String, enum: CodeType })
  type: CodeType;

  @Prop({ required: false, min: 0, max: 100 })
  discountPercentage?: number;

  @Prop({ required: false, min: 0 })
  discountAmount?: number;

  @Prop({ required: true, type: String, enum: CodeStatus, default: CodeStatus.ACTIVE })
  status: CodeStatus;

  @Prop({ required: false })
  expiryDate?: Date;

  @Prop({ required: true, default: 0 })
  usageLimit: number;

  @Prop({ required: true, default: 0 })
  usageCount: number;

  @Prop({ required: false })
  description?: string;
}

export const CodeSchema = SchemaFactory.createForClass(Code);

// Indexes
// Note: code field already has unique: true which creates an index
CodeSchema.index({ status: 1 });
CodeSchema.index({ expiryDate: 1 });

