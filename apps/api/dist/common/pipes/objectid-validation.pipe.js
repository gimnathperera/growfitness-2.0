"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectIdValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const error_codes_enum_1 = require("../enums/error-codes.enum");
let ObjectIdValidationPipe = class ObjectIdValidationPipe {
    transform(value, metadata) {
        if (!value) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_ID,
                message: 'ID parameter is required',
            });
        }
        if (!mongoose_1.Types.ObjectId.isValid(value)) {
            const paramName = metadata.data || 'id';
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_ID,
                message: `Invalid ${paramName} format. Expected a valid MongoDB ObjectId.`,
            });
        }
        return value;
    }
};
exports.ObjectIdValidationPipe = ObjectIdValidationPipe;
exports.ObjectIdValidationPipe = ObjectIdValidationPipe = __decorate([
    (0, common_1.Injectable)()
], ObjectIdValidationPipe);
//# sourceMappingURL=objectid-validation.pipe.js.map