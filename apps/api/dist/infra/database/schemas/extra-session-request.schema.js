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
exports.ExtraSessionRequestSchema = exports.ExtraSessionRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shared_types_1 = require("@grow-fitness/shared-types");
let ExtraSessionRequest = class ExtraSessionRequest {
    parentId;
    kidId;
    coachId;
    sessionType;
    locationId;
    preferredDateTime;
    status;
};
exports.ExtraSessionRequest = ExtraSessionRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExtraSessionRequest.prototype, "parentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Kid', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExtraSessionRequest.prototype, "kidId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExtraSessionRequest.prototype, "coachId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.SessionType }),
    __metadata("design:type", String)
], ExtraSessionRequest.prototype, "sessionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Location', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExtraSessionRequest.prototype, "locationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], ExtraSessionRequest.prototype, "preferredDateTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.RequestStatus, default: shared_types_1.RequestStatus.PENDING }),
    __metadata("design:type", String)
], ExtraSessionRequest.prototype, "status", void 0);
exports.ExtraSessionRequest = ExtraSessionRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], ExtraSessionRequest);
exports.ExtraSessionRequestSchema = mongoose_1.SchemaFactory.createForClass(ExtraSessionRequest);
exports.ExtraSessionRequestSchema.index({ status: 1 });
exports.ExtraSessionRequestSchema.index({ parentId: 1 });
exports.ExtraSessionRequestSchema.index({ createdAt: -1 });
//# sourceMappingURL=extra-session-request.schema.js.map