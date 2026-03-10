export declare class PaginationDto {
    page: number;
    limit: number;
    search?: string;
}
export declare class PaginatedResponseDto<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    constructor(data: T[], total: number, page: number, limit: number);
}
