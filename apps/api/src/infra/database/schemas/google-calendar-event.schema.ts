import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GoogleCalendarEventDocument = GoogleCalendarEvent & Document;

@Schema({ timestamps: true })
export class GoogleCalendarEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId;

  @Prop({ required: true, type: String })
  googleEventId: string;
}

export const GoogleCalendarEventSchema = SchemaFactory.createForClass(GoogleCalendarEvent);

GoogleCalendarEventSchema.set('toObject', {
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id?.toString?.() ?? ret.id;
    delete ret._id;
    delete ret.__v;
    ret.userId = ret.userId?.toString?.() ?? ret.userId;
    ret.sessionId = ret.sessionId?.toString?.() ?? ret.sessionId;
    return ret;
  },
});

GoogleCalendarEventSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    ret.id = ret._id?.toString?.() ?? ret.id;
    delete ret._id;
    delete ret.__v;
    ret.userId = ret.userId?.toString?.() ?? ret.userId;
    ret.sessionId = ret.sessionId?.toString?.() ?? ret.sessionId;
    return ret;
  },
});

GoogleCalendarEventSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
GoogleCalendarEventSchema.index({ userId: 1 });
GoogleCalendarEventSchema.index({ sessionId: 1 });

