import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionType, SessionStatus } from '@grow-fitness/shared-types';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, type: String, enum: SessionType })
  type: SessionType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  coachId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ required: true })
  duration: number; // minutes

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({ type: [Types.ObjectId], ref: 'Kid', required: false })
  kids?: Types.ObjectId[]; // for group sessions

  @Prop({ type: Types.ObjectId, ref: 'Kid', required: false })
  kidId?: Types.ObjectId; // for individual sessions

  @Prop({ required: true, type: String, enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Prop({ required: true, default: false })
  isFreeSession: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes
SessionSchema.index({ dateTime: 1 });
SessionSchema.index({ coachId: 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ locationId: 1 });
SessionSchema.index({ isFreeSession: 1 });
