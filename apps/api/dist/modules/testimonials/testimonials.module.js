"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const testimonials_controller_1 = require("./testimonials.controller");
const testimonials_service_1 = require("./testimonials.service");
const testimonial_schema_1 = require("../../infra/database/schemas/testimonial.schema");
const audit_module_1 = require("../audit/audit.module");
let TestimonialsModule = class TestimonialsModule {
};
exports.TestimonialsModule = TestimonialsModule;
exports.TestimonialsModule = TestimonialsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: testimonial_schema_1.Testimonial.name, schema: testimonial_schema_1.TestimonialSchema }]),
            audit_module_1.AuditModule,
        ],
        controllers: [testimonials_controller_1.TestimonialsController],
        providers: [testimonials_service_1.TestimonialsService],
        exports: [testimonials_service_1.TestimonialsService],
    })
], TestimonialsModule);
//# sourceMappingURL=testimonials.module.js.map