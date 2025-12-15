import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BannerTargetAudience } from '@grow-fitness/shared-types';

export type ResourceDocument = Resource & Document;

export enum ResourceType {
  DOCUMENT = 'DOCUMENT',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  PDF = 'PDF',
}

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: String, enum: ResourceType })
  type: ResourceType;

  @Prop({ required: false })
  content?: string;

  @Prop({ required: false })
  fileUrl?: string;

  @Prop({ required: false })
  externalUrl?: string;

  @Prop({ required: true, type: String, enum: BannerTargetAudience })
  targetAudience: BannerTargetAudience;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Indexes
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ targetAudience: 1 });
ResourceSchema.index({ isActive: 1 });
ResourceSchema.index({ tags: 1 });

