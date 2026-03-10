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
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const class_transformer_1 = require("class-transformer");
const shared_types_1 = require("@grow-fitness/shared-types");
let User = class User {
    role;
    email;
    phone;
    passwordHash;
    status;
    isApproved;
    parentProfile;
    coachProfile;
    googleCalendarRefreshToken;
    googleCalendarConnectedAt;
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.UserRole }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: shared_types_1.UserStatus, default: shared_types_1.UserStatus.ACTIVE }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isApproved", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            name: { type: String, required: false },
            location: { type: String, required: false },
        },
        required: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "parentProfile", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            name: { type: String, required: false },
        },
        required: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "coachProfile", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: String }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "googleCalendarRefreshToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Date }),
    __metadata("design:type", Date)
], User.prototype, "googleCalendarConnectedAt", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ role: 1 });
exports.UserSchema.index({ status: 1 });
exports.UserSchema.index({ isApproved: 1 });
//# sourceMappingURL=user.schema.js.map