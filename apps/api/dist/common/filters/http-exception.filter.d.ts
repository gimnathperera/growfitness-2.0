import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export interface ErrorResponse {
    statusCode: number;
    errorCode: string;
    message: string;
    timestamp: string;
    path: string;
    errors?: string[];
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private getErrorCodeFromStatus;
}
