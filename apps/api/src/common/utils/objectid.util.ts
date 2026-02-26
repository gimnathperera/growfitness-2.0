import { Types } from 'mongoose';

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns true if valid, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return Types.ObjectId.isValid(id);
}

/**
 * Validates an ObjectId and throws a BadRequestException if invalid
 * @param id - The string to validate
 * @param entityName - Optional entity name for error message (e.g., "User", "Kid")
 * @throws BadRequestException if the ID is invalid
 */
export function validateObjectId(id: string, entityName?: string): void {
  if (!isValidObjectId(id)) {
    const entity = entityName ? `${entityName} ` : '';
    throw new Error(`Invalid ${entity}ID format`);
  }
}
