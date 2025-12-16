import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SessionType, SessionStatus } from '@grow-fitness/shared-types';

const toObjectId = (value: Types.ObjectId | string | undefined | null) => {
  if (value === undefined || value === null) {
    return value;
  }
  return new Types.ObjectId(value);
};

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, type: String, enum: SessionType })
  type: SessionType;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    set: toObjectId,
  })
  coachId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Location',
    required: true,
    set: toObjectId,
  })
  locationId: Types.ObjectId;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ required: true })
  duration: number; // minutes

  @Prop({ required: true, min: 1 })
  capacity: number;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Kid',
    required: false,
    set: (value: (Types.ObjectId | string)[] | undefined | null) =>
      value?.map(kidId => toObjectId(kidId)) ?? value,
  })
  kids?: Types.ObjectId[];

  @Prop({ required: true, type: String, enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Prop({ required: true, default: false })
  isFreeSession: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

const formatRef = (value: any) => {
  if (value && typeof value === 'object' && '_id' in value) {
    return value;
  }
  return value?.toString?.() ?? value;
};

const normalizeKid = (kid: any) => {
  if (kid && typeof kid === 'object' && '_id' in kid) {
    const hasExtra = Object.keys(kid).some(key => !['_id', '__v'].includes(key));
    if (hasExtra) {
      return {
        ...kid,
        _id: kid._id.toString(),
        id: kid._id.toString(),
      };
    }
    return kid._id.toString();
  }
  return kid?.toString?.() ?? kid;
};

SessionSchema.set('toObject', {
  transform: (_, ret) => {
    ret.id = ret._id?.toString?.() ?? ret.id;
    delete ret._id;
    delete ret.__v;
    delete ret.kidId;
    ret.coachId = formatRef(ret.coachId);
    ret.locationId = formatRef(ret.locationId);
    ret.kids = Array.isArray(ret.kids) ? ret.kids.map(normalizeKid) : ret.kids;
    return ret;
  },
});

SessionSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id?.toString?.() ?? ret.id;
    delete ret._id;
    delete ret.__v;
    delete ret.kidId;
    ret.coachId = formatRef(ret.coachId);
    ret.locationId = formatRef(ret.locationId);
    ret.kids = Array.isArray(ret.kids) ? ret.kids.map(normalizeKid) : ret.kids;
    return ret;
  },
});

// Indexes
SessionSchema.index({ dateTime: 1 });
SessionSchema.index({ coachId: 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ locationId: 1 });
SessionSchema.index({ isFreeSession: 1 });
