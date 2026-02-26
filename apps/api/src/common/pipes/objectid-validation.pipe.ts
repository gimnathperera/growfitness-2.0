import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { Types } from 'mongoose';
import { ErrorCode } from '../enums/error-codes.enum';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_ID,
        message: 'ID parameter is required',
      });
    }

    if (!Types.ObjectId.isValid(value)) {
      const paramName = metadata.data || 'id';
      throw new BadRequestException({
        errorCode: ErrorCode.INVALID_ID,
        message: `Invalid ${paramName} format. Expected a valid MongoDB ObjectId.`,
      });
    }

    return value;
  }
}
