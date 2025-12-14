import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionType, RequestStatus } from '@grow-fitness/shared-types';

export type ExtraSessionRequestDocument = ExtraSessionRequest & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ExtraSessionRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  parentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Kid', required: true })
  kidId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  coachId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: SessionType })
  sessionType: SessionType;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  preferredDateTime: Date;

  @Prop({ required: true, type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;
}

export const ExtraSessionRequestSchema = SchemaFactory.createForClass(ExtraSessionRequest);

// Indexes
ExtraSessionRequestSchema.index({ status: 1 });
ExtraSessionRequestSchema.index({ parentId: 1 });
ExtraSessionRequestSchema.index({ createdAt: -1 });
