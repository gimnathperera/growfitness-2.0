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
exports.UserRegistrationRequestSchema = exports.UserRegistrationRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shared_types_1 = require("@grow-fitness/shared-types");
let UserRegistrationRequest = class UserRegistrationRequest {
    parentId;
    status;
    processedAt;
    processedBy;
};
exports.UserRegistrationRequest = UserRegistrationRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserRegistrationRequest.prototype, "parentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.RequestStatus, default: shared_types_1.RequestStatus.PENDING }),
    __metadata("design:type", String)
], UserRegistrationRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Date }),
    __metadata("design:type", Date)
], UserRegistrationRequest.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], UserRegistrationRequest.prototype, "processedBy", void 0);
exports.UserRegistrationRequest = UserRegistrationRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], UserRegistrationRequest);
exports.UserRegistrationRequestSchema = mongoose_1.SchemaFactory.createForClass(UserRegistrationRequest);
exports.UserRegistrationRequestSchema.index({ status: 1 });
exports.UserRegistrationRequestSchema.index({ createdAt: -1 });
exports.UserRegistrationRequestSchema.index({ parentId: 1 });
//# sourceMappingURL=user-registration-request.schema.js.map