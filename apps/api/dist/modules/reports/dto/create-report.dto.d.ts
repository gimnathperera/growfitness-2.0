export declare class CreateReportDto {
    type: string;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    filters?: Record<string, unknown>;
}
