import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BannerTargetAudience } from '@grow-fitness/shared-types';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, default: true })
  active: boolean;

  @Prop({ required: true, min: 0 })
  order: number;

  @Prop({ required: true, type: String, enum: BannerTargetAudience })
  targetAudience: BannerTargetAudience;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Indexes
BannerSchema.index({ active: 1 });
BannerSchema.index({ order: 1 });
