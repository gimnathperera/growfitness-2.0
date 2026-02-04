import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionType } from '@grow-fitness/shared-types';

export type KidDocument = Kid & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Kid {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  parentId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: false })
  goal?: string;

  @Prop({ required: true, default: false })
  currentlyInSports: boolean;

  @Prop({ type: [String], default: [] })
  medicalConditions: string[];

  @Prop({ required: true, type: String, enum: SessionType })
  sessionType: SessionType;

  @Prop({ type: [Types.ObjectId], default: [] })
  achievements?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  milestones?: Types.ObjectId[];

  @Prop({ required: false, type: Boolean, default: false })
  isApproved: boolean;
}

export const KidSchema = SchemaFactory.createForClass(Kid);

// Indexes
KidSchema.index({ parentId: 1 });
KidSchema.index({ sessionType: 1 });
KidSchema.index({ isApproved: 1 });
