import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { ErrorCode } from '../enums/error-codes.enum';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => {
          const path = err.path.join('.') || 'body';
          return `${path}: ${err.message}`;
        });
        throw new BadRequestException({
          errorCode: ErrorCode.VALIDATION_ERROR,
          message: errorMessages.length > 0 ? errorMessages.join('; ') : 'Validation failed',
          errors: errorMessages,
        });
      }
      throw new BadRequestException({
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
      });
    }
  }
}
