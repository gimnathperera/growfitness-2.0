/**
 * Sanitizes Mongoose documents by:
 * - Removing sensitive fields (passwordHash, __v)
 * - Transforming _id to id (only if id doesn't already exist)
 * - Handling nested objects and arrays
 * - Preserving ObjectId references
 */
export function sanitizeDocument<T>(doc: T): any {
  if (!doc) {
    return doc;
  }

  // Handle arrays
  if (Array.isArray(doc)) {
    return doc.map(item => sanitizeDocument(item));
  }

  // Handle plain objects and Mongoose documents
  if (typeof doc === 'object' && doc !== null) {
    // Convert Mongoose document to plain object if needed
    const plainObj =
      doc && typeof (doc as any).toObject === 'function'
        ? (doc as any).toObject({ virtuals: true })
        : doc;

    const sanitized: any = {};
    let hasId = false;

    // First pass: check if 'id' already exists
    if ('id' in plainObj) {
      hasId = true;
    }

    for (const [key, value] of Object.entries(plainObj)) {
      // Skip sensitive fields
      if (key === 'passwordHash' || key === '__v') {
        continue;
      }

      // Transform _id to id (only if id doesn't already exist)
      if (key === '_id') {
        if (!hasId) {
          // Convert ObjectId to string if it's an ObjectId instance
          sanitized.id =
            value && typeof value === 'object' && 'toString' in value ? value.toString() : value;
        }
        // If id already exists, skip _id
        continue;
      }

      // Recursively sanitize nested objects
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          sanitized[key] = value.map(item => sanitizeDocument(item));
        } else if (value instanceof Date) {
          sanitized[key] = value;
        } else if (
          value &&
          typeof (value as any).toString === 'function' &&
          (value as any).constructor?.name === 'ObjectId'
        ) {
          // Preserve ObjectId as string
          sanitized[key] = value.toString();
        } else {
          sanitized[key] = sanitizeDocument(value);
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return doc;
}
