import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { NotificationDocument } from '../../infra/database/schemas/notification.schema';
import { NotificationType } from '@grow-fitness/shared-types';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export interface CreateInAppNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
}
export interface FreeSessionConfirmationData {
    email: string;
    phone: string;
    parentName: string;
    kidName: string;
    sessionId?: string;
}
export interface SessionChangeData {
    email: string;
    phone: string;
    sessionId: string;
    changes: string;
}
export interface InvoiceUpdateData {
    invoiceId: string;
    parentId: string;
    status: string;
    email?: string;
    phone?: string;
}
export interface RegistrationApprovedData {
    email: string;
    phone: string;
    parentName?: string;
}
export interface CoachPayoutPaidData {
    email?: string;
    phone: string;
    coachName?: string;
    invoiceId: string;
}
export interface NewInvoiceData {
    email?: string;
    phone: string;
    recipientName?: string;
}
export declare class NotificationService {
    private notificationModel;
    private emailProvider;
    private whatsAppProvider;
    private configService;
    constructor(notificationModel: Model<NotificationDocument>, emailProvider: EmailProvider, whatsAppProvider: WhatsAppProvider, configService: ConfigService);
    sendFreeSessionConfirmation(data: FreeSessionConfirmationData): Promise<void>;
    sendSessionChange(data: SessionChangeData): Promise<void>;
    sendInvoiceUpdate(data: InvoiceUpdateData): Promise<void>;
    sendRegistrationApproved(data: RegistrationApprovedData): Promise<void>;
    sendCoachPayoutPaid(data: CoachPayoutPaidData): Promise<void>;
    sendNewInvoiceToParent(data: NewInvoiceData): Promise<void>;
    sendPaymentReminder(data: NewInvoiceData): Promise<void>;
    createNotification(dto: CreateInAppNotificationDto): Promise<NotificationDocument>;
    findAllForUser(userId: string, pagination: PaginationDto, filter?: {
        read?: boolean;
    }): Promise<PaginatedResponseDto<NotificationDocument>>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<NotificationDocument>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    deleteOne(id: string, userId: string): Promise<void>;
    deleteAll(userId: string): Promise<{
        deletedCount: number;
    }>;
    sendPasswordResetEmail(user: UserDocument, resetToken: string): Promise<void>;
}
