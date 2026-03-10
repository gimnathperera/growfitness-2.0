"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const error_codes_enum_1 = require("../enums/error-codes.enum");
let ZodValidationPipe = class ZodValidationPipe {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    transform(value, metadata) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map(err => {
                    const path = err.path.join('.') || 'body';
                    return `${path}: ${err.message}`;
                });
                throw new common_1.BadRequestException({
                    errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                    message: errorMessages.length > 0 ? errorMessages.join('; ') : 'Validation failed',
                    errors: errorMessages,
                });
            }
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
                message: 'Validation failed',
            });
        }
    }
};
exports.ZodValidationPipe = ZodValidationPipe;
exports.ZodValidationPipe = ZodValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zod_1.ZodSchema])
], ZodValidationPipe);
//# sourceMappingURL=zod-validation.pipe.js.map