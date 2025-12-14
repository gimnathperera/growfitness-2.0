import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestStatus } from '@grow-fitness/shared-types';

export type RescheduleRequestDocument = RescheduleRequest & Document;

@Schema({ timestamps: true })
export class RescheduleRequest {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requestedBy: Types.ObjectId;

  @Prop({ required: true })
  newDateTime: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop({ required: false })
  processedAt?: Date;
}

export const RescheduleRequestSchema = SchemaFactory.createForClass(RescheduleRequest);

// Indexes
RescheduleRequestSchema.index({ status: 1 });
RescheduleRequestSchema.index({ sessionId: 1 });
RescheduleRequestSchema.index({ requestedBy: 1 });
RescheduleRequestSchema.index({ createdAt: -1 });
