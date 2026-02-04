import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionType, RequestStatus } from '@grow-fitness/shared-types';

export type FreeSessionRequestDocument = FreeSessionRequest & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class FreeSessionRequest {
  @Prop({ required: true })
  parentName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  kidName: string;

  @Prop({ required: true, type: String, enum: SessionType })
  sessionType: SessionType;

  @Prop({ type: Types.ObjectId, ref: 'Session', required: false })
  selectedSessionId?: Types.ObjectId;

  @Prop({ type: Date, required: false })
  preferredDateTime?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: false })
  locationId?: Types.ObjectId;

  @Prop({ required: true, type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;
}

export const FreeSessionRequestSchema = SchemaFactory.createForClass(FreeSessionRequest);

// Indexes
FreeSessionRequestSchema.index({ status: 1 });
FreeSessionRequestSchema.index({ createdAt: -1 });
