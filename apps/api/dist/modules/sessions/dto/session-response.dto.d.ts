declare class SessionCoachRefDto {
    id: string;
    email: string;
    coachProfile?: {
        name: string;
    };
}
declare class SessionLocationRefDto {
    id: string;
    name: string;
    address: string;
    geo?: {
        lat: number;
        lng: number;
    };
    isActive: boolean;
    placeUrl?: string;
}
export declare class SessionResponseDto {
    id: string;
    title: string;
    type: string;
    coachId: string;
    locationId: string;
    coach?: SessionCoachRefDto;
    location?: SessionLocationRefDto;
    dateTime: Date;
    duration: number;
    capacity: number;
    kids?: string[];
    status: string;
    isFreeSession: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedSessionResponseDto {
    data: SessionResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export {};
