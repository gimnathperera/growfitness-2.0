import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../enums/error-codes.enum';

export interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (Array.isArray(responseObj.message)
            ? (responseObj.message as string[]).join(', ')
            : exception.message);
        errorCode =
          (responseObj.errorCode as ErrorCode) || this.getErrorCodeFromStatus(status);
      } else {
        message = exception.message;
        errorCode = this.getErrorCodeFromStatus(status);
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}

