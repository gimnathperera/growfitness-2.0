"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const error_codes_enum_1 = require("../enums/error-codes.enum");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = error_codes_enum_1.ErrorCode.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        const errors = [];
        if (exception instanceof mongoose_1.Error.CastError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            errorCode = error_codes_enum_1.ErrorCode.INVALID_ID;
            message = `Invalid ID format: ${exception.value}. Expected a valid MongoDB ObjectId.`;
        }
        else if (exception instanceof mongoose_1.Error.ValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            errorCode = error_codes_enum_1.ErrorCode.VALIDATION_ERROR;
            message = 'Validation failed';
            Object.keys(exception.errors).forEach(key => {
                const error = exception.errors[key];
                if (error instanceof mongoose_1.Error.ValidatorError) {
                    errors.push(`${key}: ${error.message}`);
                }
                else if (error instanceof mongoose_1.Error.CastError) {
                    errors.push(`${key}: Invalid value "${error.value}"`);
                }
                else if (error && typeof error.message === 'string') {
                    errors.push(`${key}: ${error.message}`);
                }
                else {
                    errors.push(`${key}: Validation failed`);
                }
            });
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                message =
                    responseObj.message ||
                        (Array.isArray(responseObj.message)
                            ? responseObj.message.join(', ')
                            : exception.message);
                errorCode = responseObj.errorCode || this.getErrorCodeFromStatus(status);
            }
            else {
                message = exception.message;
                errorCode = this.getErrorCodeFromStatus(status);
            }
        }
        const errorResponse = {
            statusCode: status,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (errors.length > 0) {
            errorResponse.errors = errors;
        }
        else if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const responseObj = exceptionResponse;
                if (Array.isArray(responseObj.errors)) {
                    errorResponse.errors = responseObj.errors;
                }
            }
        }
        if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR && !(exception instanceof common_1.HttpException)) {
            console.error('Unhandled error:', exception);
            if (exception instanceof Error) {
                console.error('Error stack:', exception.stack);
            }
        }
        response.status(status).json(errorResponse);
    }
    getErrorCodeFromStatus(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return error_codes_enum_1.ErrorCode.VALIDATION_ERROR;
            case common_1.HttpStatus.UNAUTHORIZED:
                return error_codes_enum_1.ErrorCode.UNAUTHORIZED;
            case common_1.HttpStatus.FORBIDDEN:
                return error_codes_enum_1.ErrorCode.FORBIDDEN;
            case common_1.HttpStatus.NOT_FOUND:
                return error_codes_enum_1.ErrorCode.NOT_FOUND;
            default:
                return error_codes_enum_1.ErrorCode.INTERNAL_SERVER_ERROR;
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map