import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RequestStatus } from '@grow-fitness/shared-types';

export type UserRegistrationRequestDocument = UserRegistrationRequest & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class UserRegistrationRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  parentId: Types.ObjectId;

  @Prop({ required: true, type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Prop({ required: false, type: Date })
  processedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  processedBy?: Types.ObjectId;
}

export const UserRegistrationRequestSchema = SchemaFactory.createForClass(UserRegistrationRequest);

// Indexes
UserRegistrationRequestSchema.index({ status: 1 });
UserRegistrationRequestSchema.index({ createdAt: -1 });
UserRegistrationRequestSchema.index({ parentId: 1 });
