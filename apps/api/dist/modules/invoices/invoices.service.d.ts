import { Model } from 'mongoose';
import { InvoiceDocument } from '../../infra/database/schemas/invoice.schema';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
export declare class InvoicesService {
    private invoiceModel;
    private userModel;
    private auditService;
    private notificationService;
    constructor(invoiceModel: Model<InvoiceDocument>, userModel: Model<UserDocument>, auditService: AuditService, notificationService: NotificationService);
    findAll(pagination: PaginationDto, filters?: {
        type?: InvoiceType;
        parentId?: string;
        coachId?: string;
        status?: InvoiceStatus;
    }): Promise<PaginatedResponseDto<{
        id: any;
        type: any;
        parentId: any;
        coachId: any;
        parent: {
            id: any;
            email: any;
            parentProfile: any;
        } | undefined;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        items: any;
        totalAmount: any;
        status: any;
        dueDate: any;
        paidAt: any;
        exportFields: any;
        createdAt: any;
        updatedAt: any;
    }>>;
    findById(id: string): Promise<{
        id: any;
        type: any;
        parentId: any;
        coachId: any;
        parent: {
            id: any;
            email: any;
            parentProfile: any;
        } | undefined;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        items: any;
        totalAmount: any;
        status: any;
        dueDate: any;
        paidAt: any;
        exportFields: any;
        createdAt: any;
        updatedAt: any;
    }>;
    private toInvoiceResponse;
    create(createInvoiceDto: CreateInvoiceDto, actorId: string): Promise<{
        id: any;
        type: any;
        parentId: any;
        coachId: any;
        parent: {
            id: any;
            email: any;
            parentProfile: any;
        } | undefined;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        items: any;
        totalAmount: any;
        status: any;
        dueDate: any;
        paidAt: any;
        exportFields: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updatePaymentStatus(id: string, updateDto: UpdateInvoicePaymentStatusDto, actorId: string): Promise<{
        id: any;
        type: any;
        parentId: any;
        coachId: any;
        parent: {
            id: any;
            email: any;
            parentProfile: any;
        } | undefined;
        coach: {
            id: any;
            email: any;
            coachProfile: any;
        } | undefined;
        items: any;
        totalAmount: any;
        status: any;
        dueDate: any;
        paidAt: any;
        exportFields: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getFinanceSummary(): Promise<{
        totalRevenue: any;
        pendingAmount: any;
        overdueAmount: any;
    }>;
    exportCSV(filters?: {
        type?: InvoiceType;
        parentId?: string;
        coachId?: string;
        status?: InvoiceStatus;
    }): Promise<string>;
}
