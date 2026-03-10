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
exports.CodeSchema = exports.Code = exports.CodeStatus = exports.CodeType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var CodeType;
(function (CodeType) {
    CodeType["DISCOUNT"] = "DISCOUNT";
    CodeType["PROMO"] = "PROMO";
    CodeType["REFERRAL"] = "REFERRAL";
})(CodeType || (exports.CodeType = CodeType = {}));
var CodeStatus;
(function (CodeStatus) {
    CodeStatus["ACTIVE"] = "ACTIVE";
    CodeStatus["INACTIVE"] = "INACTIVE";
    CodeStatus["EXPIRED"] = "EXPIRED";
})(CodeStatus || (exports.CodeStatus = CodeStatus = {}));
let Code = class Code {
    code;
    type;
    discountPercentage;
    discountAmount;
    status;
    expiryDate;
    usageLimit;
    usageCount;
    description;
};
exports.Code = Code;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, uppercase: true }),
    __metadata("design:type", String)
], Code.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: CodeType }),
    __metadata("design:type", String)
], Code.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Code.prototype, "discountPercentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, min: 0 }),
    __metadata("design:type", Number)
], Code.prototype, "discountAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: CodeStatus, default: CodeStatus.ACTIVE }),
    __metadata("design:type", String)
], Code.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Code.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Code.prototype, "usageLimit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Code.prototype, "usageCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Code.prototype, "description", void 0);
exports.Code = Code = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Code);
exports.CodeSchema = mongoose_1.SchemaFactory.createForClass(Code);
exports.CodeSchema.index({ status: 1 });
exports.CodeSchema.index({ expiryDate: 1 });
//# sourceMappingURL=code.schema.js.map