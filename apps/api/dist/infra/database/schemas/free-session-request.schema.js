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
exports.FreeSessionRequestSchema = exports.FreeSessionRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shared_types_1 = require("@grow-fitness/shared-types");
let FreeSessionRequest = class FreeSessionRequest {
    parentName;
    phone;
    email;
    kidName;
    sessionType;
    selectedSessionId;
    preferredDateTime;
    locationId;
    status;
};
exports.FreeSessionRequest = FreeSessionRequest;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "parentName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "kidName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.SessionType }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "sessionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Session', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FreeSessionRequest.prototype, "selectedSessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Date)
], FreeSessionRequest.prototype, "preferredDateTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Location', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], FreeSessionRequest.prototype, "locationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.RequestStatus, default: shared_types_1.RequestStatus.PENDING }),
    __metadata("design:type", String)
], FreeSessionRequest.prototype, "status", void 0);
exports.FreeSessionRequest = FreeSessionRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false } })
], FreeSessionRequest);
exports.FreeSessionRequestSchema = mongoose_1.SchemaFactory.createForClass(FreeSessionRequest);
exports.FreeSessionRequestSchema.index({ status: 1 });
exports.FreeSessionRequestSchema.index({ createdAt: -1 });
//# sourceMappingURL=free-session-request.schema.js.map