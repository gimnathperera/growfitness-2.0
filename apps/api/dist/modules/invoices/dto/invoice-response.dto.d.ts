declare class InvoiceParentRefDto {
    id: string;
    email: string;
    parentProfile?: {
        name: string;
        location?: string;
    };
}
declare class InvoiceCoachRefDto {
    id: string;
    email: string;
    coachProfile?: {
        name: string;
    };
}
declare class InvoiceItemDto {
    description: string;
    amount: number;
}
export declare class InvoiceResponseDto {
    id: string;
    type: string;
    parentId?: string;
    coachId?: string;
    parent?: InvoiceParentRefDto;
    coach?: InvoiceCoachRefDto;
    items: InvoiceItemDto[];
    totalAmount: number;
    status: string;
    dueDate: Date;
    paidAt?: Date;
    exportFields?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedInvoiceResponseDto {
    data: InvoiceResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export {};
