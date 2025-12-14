import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({
    type: {
      name: { type: String, required: false },
      location: { type: String, required: false },
    },
    required: false,
  })
  parentProfile?: {
    name: string;
    location?: string;
  };

  @Prop({
    type: {
      name: { type: String, required: false },
    },
    required: false,
  })
  coachProfile?: {
    name: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
