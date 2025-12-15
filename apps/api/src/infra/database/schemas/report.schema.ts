import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

export enum ReportType {
  ATTENDANCE = 'ATTENDANCE',
  PERFORMANCE = 'PERFORMANCE',
  FINANCIAL = 'FINANCIAL',
  SESSION_SUMMARY = 'SESSION_SUMMARY',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true, type: String, enum: ReportType })
  type: ReportType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, type: String, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Prop({ required: false })
  startDate?: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ type: Object, required: false })
  filters?: Record<string, unknown>;

  @Prop({ type: Object, required: false })
  data?: Record<string, unknown>; // Generated report data

  @Prop({ required: false })
  fileUrl?: string; // If exported to file

  @Prop({ required: false })
  generatedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes
ReportSchema.index({ type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ startDate: 1, endDate: 1 });
ReportSchema.index({ createdAt: -1 });

