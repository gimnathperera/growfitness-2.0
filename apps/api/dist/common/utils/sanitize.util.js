"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeDocument = sanitizeDocument;
function sanitizeDocument(doc) {
    if (!doc) {
        return doc;
    }
    if (Array.isArray(doc)) {
        return doc.map(item => sanitizeDocument(item));
    }
    if (typeof doc === 'object' && doc !== null) {
        const plainObj = doc && typeof doc.toObject === 'function'
            ? doc.toObject({ virtuals: true })
            : doc;
        const sanitized = {};
        let hasId = false;
        if ('id' in plainObj) {
            hasId = true;
        }
        for (const [key, value] of Object.entries(plainObj)) {
            if (key === 'passwordHash' || key === '__v') {
                continue;
            }
            if (key === '_id') {
                if (!hasId) {
                    sanitized.id =
                        value && typeof value === 'object' && 'toString' in value ? value.toString() : value;
                }
                continue;
            }
            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    sanitized[key] = value.map(item => sanitizeDocument(item));
                }
                else if (value instanceof Date) {
                    sanitized[key] = value;
                }
                else if (value &&
                    typeof value.toString === 'function' &&
                    value.constructor?.name === 'ObjectId') {
                    sanitized[key] = value.toString();
                }
                else {
                    sanitized[key] = sanitizeDocument(value);
                }
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    return doc;
}
//# sourceMappingURL=sanitize.util.js.map