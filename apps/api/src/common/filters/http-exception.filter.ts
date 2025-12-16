import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ErrorCode } from '../enums/error-codes.enum';

export interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  errors?: string[];
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
    const errors: string[] = [];

    // Handle Mongoose CastError (invalid ObjectId)
    if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.INVALID_ID;
      message = `Invalid ID format: ${exception.value}. Expected a valid MongoDB ObjectId.`;
    } else if (exception instanceof MongooseError.ValidationError) {
      // Handle Mongoose ValidationError (schema validation failures)
      status = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.VALIDATION_ERROR;
      message = 'Validation failed';

      // Extract validation error messages
      Object.keys(exception.errors).forEach(key => {
        const error: any = exception.errors[key];
        if (error instanceof MongooseError.ValidatorError) {
          errors.push(`${key}: ${error.message}`);
        } else if (error instanceof MongooseError.CastError) {
          errors.push(`${key}: Invalid value "${error.value}"`);
        } else if (error && typeof error.message === 'string') {
          errors.push(`${key}: ${error.message}`);
        } else {
          errors.push(`${key}: Validation failed`);
        }
      });
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string) ||
          (Array.isArray(responseObj.message)
            ? (responseObj.message as string[]).join(', ')
            : exception.message);
        errorCode = (responseObj.errorCode as ErrorCode) || this.getErrorCodeFromStatus(status);
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

    // Include validation errors if present
    if (errors.length > 0) {
      errorResponse.errors = errors;
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(responseObj.errors)) {
          errorResponse.errors = responseObj.errors as string[];
        }
      }
    }

    // Log unhandled errors for debugging
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof HttpException)) {
      console.error('Unhandled error:', exception);
      if (exception instanceof Error) {
        console.error('Error stack:', exception.stack);
      }
    }

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
