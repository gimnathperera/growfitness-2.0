import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CrmContactDocument = CrmContact & Document;

export enum CrmContactStatus {
  LEAD = 'LEAD',
  CONTACTED = 'CONTACTED',
  FOLLOW_UP = 'FOLLOW_UP',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
}

@Schema({ timestamps: true })
export class CrmNote {
  @Prop({ required: true })
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class CrmContact {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  parentId?: Types.ObjectId;

  @Prop({ required: false })
  name?: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: true, type: String, enum: CrmContactStatus, default: CrmContactStatus.LEAD })
  status: CrmContactStatus;

  @Prop({ type: [CrmNote], default: [] })
  notes: CrmNote[];

  @Prop({ required: false })
  followUpDate?: Date;

  @Prop({ required: false })
  source?: string; // How they found out about the service

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;
}

export const CrmContactSchema = SchemaFactory.createForClass(CrmContact);

// Indexes
CrmContactSchema.index({ parentId: 1 });
CrmContactSchema.index({ status: 1 });
CrmContactSchema.index({ followUpDate: 1 });
CrmContactSchema.index({ email: 1 });
CrmContactSchema.index({ phone: 1 });

