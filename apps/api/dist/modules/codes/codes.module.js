"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const codes_controller_1 = require("./codes.controller");
const codes_service_1 = require("./codes.service");
const code_schema_1 = require("../../infra/database/schemas/code.schema");
const audit_module_1 = require("../audit/audit.module");
let CodesModule = class CodesModule {
};
exports.CodesModule = CodesModule;
exports.CodesModule = CodesModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: code_schema_1.Code.name, schema: code_schema_1.CodeSchema }]), audit_module_1.AuditModule],
        controllers: [codes_controller_1.CodesController],
        providers: [codes_service_1.CodesService],
        exports: [codes_service_1.CodesService],
    })
], CodesModule);
//# sourceMappingURL=codes.module.js.map