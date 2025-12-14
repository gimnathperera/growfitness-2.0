import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LocationDocument = Location & Document;

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
    required: false,
  })
  geo?: {
    lat: number;
    lng: number;
  };

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Indexes
LocationSchema.index({ isActive: 1 });

