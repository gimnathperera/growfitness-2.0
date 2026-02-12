import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TestimonialDocument = Testimonial & Document;

@Schema({ timestamps: true })
export class Testimonial {
  @Prop({ required: true })
  authorName: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  childName?: string;

  @Prop({ required: false })
  childAge?: number;

  @Prop({ required: false })
  membershipDuration?: string;

  @Prop({ required: false, default: 5, min: 1, max: 5 })
  rating?: number;

  @Prop({ required: false, default: 0, min: 0 })
  order?: number;

  @Prop({ required: false, default: true })
  isActive?: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);

TestimonialSchema.index({ isActive: 1 });
TestimonialSchema.index({ order: 1 });
