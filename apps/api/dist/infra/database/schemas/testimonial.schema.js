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
exports.TestimonialSchema = exports.Testimonial = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Testimonial = class Testimonial {
    authorName;
    content;
    childName;
    childAge;
    membershipDuration;
    rating;
    order;
    isActive;
};
exports.Testimonial = Testimonial;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Testimonial.prototype, "authorName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Testimonial.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Testimonial.prototype, "childName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], Testimonial.prototype, "childAge", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Testimonial.prototype, "membershipDuration", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 5, min: 1, max: 5 }),
    __metadata("design:type", Number)
], Testimonial.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0, min: 0 }),
    __metadata("design:type", Number)
], Testimonial.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: true }),
    __metadata("design:type", Boolean)
], Testimonial.prototype, "isActive", void 0);
exports.Testimonial = Testimonial = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Testimonial);
exports.TestimonialSchema = mongoose_1.SchemaFactory.createForClass(Testimonial);
exports.TestimonialSchema.index({ isActive: 1 });
exports.TestimonialSchema.index({ order: 1 });
//# sourceMappingURL=testimonial.schema.js.map