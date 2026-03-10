import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoiceType, InvoiceStatus } from '@grow-fitness/shared-types';
import { CreateInvoiceDto, UpdateInvoicePaymentStatusDto } from '@grow-fitness/shared-schemas';
import { GetInvoicesQueryDto } from './dto/get-invoices-query.dto';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    findAll(query: GetInvoicesQueryDto): Promise<import("../../common/dto/pagination.dto").PaginatedResponseDto<{
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
    exportCSV(res: Response, type?: InvoiceType, parentId?: string, coachId?: string, status?: InvoiceStatus): Promise<void>;
}
