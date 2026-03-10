"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = isValidObjectId;
exports.validateObjectId = validateObjectId;
const mongoose_1 = require("mongoose");
function isValidObjectId(id) {
    if (!id || typeof id !== 'string') {
        return false;
    }
    return mongoose_1.Types.ObjectId.isValid(id);
}
function validateObjectId(id, entityName) {
    if (!isValidObjectId(id)) {
        const entity = entityName ? `${entityName} ` : '';
        throw new Error(`Invalid ${entity}ID format`);
    }
}
//# sourceMappingURL=objectid.util.js.map