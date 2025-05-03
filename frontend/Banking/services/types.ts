// Common response types
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
    details?: any;
}

// Common date types
export type ISODateString = string; // YYYY-MM-DD
export type ISODateTimeString = string; // YYYY-MM-DDTHH:mm:ss.sssZ

// Paginated response interface
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Generic API response handler
export type ApiResponse<T> = T | ApiError;

// User-related types
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    DELETED = 'deleted'
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    full_name: string;
    profile_image?: string | null;
    phone?: string | null;
    status: UserStatus;
    is_email_verified: boolean;
    uses_banking_app: boolean;
    created_at: ISODateTimeString;
    updated_at: ISODateTimeString;
}

// Common error handling response
export interface ErrorResponse {
    detail: string;
    code?: string;
    field?: string;
}