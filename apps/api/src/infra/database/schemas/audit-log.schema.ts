import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: false })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  actorId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true })
  entityId: Types.ObjectId;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ actorId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ entityId: 1 });

