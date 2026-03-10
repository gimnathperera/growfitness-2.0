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
exports.CreateTestimonialBodyDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTestimonialBodyDto {
    authorName;
    content;
    childName;
    childAge;
    membershipDuration;
    rating;
    order;
    isActive;
}
exports.CreateTestimonialBodyDto = CreateTestimonialBodyDto;
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", String)
], CreateTestimonialBodyDto.prototype, "authorName", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", String)
], CreateTestimonialBodyDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", String)
], CreateTestimonialBodyDto.prototype, "childName", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Number)
], CreateTestimonialBodyDto.prototype, "childAge", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", String)
], CreateTestimonialBodyDto.prototype, "membershipDuration", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Number)
], CreateTestimonialBodyDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Number)
], CreateTestimonialBodyDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.Allow)(),
    __metadata("design:type", Boolean)
], CreateTestimonialBodyDto.prototype, "isActive", void 0);
//# sourceMappingURL=create-testimonial-body.dto.js.map