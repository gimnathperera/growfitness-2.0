"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KidsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const kids_controller_1 = require("./kids.controller");
const kids_service_1 = require("./kids.service");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const audit_module_1 = require("../audit/audit.module");
let KidsModule = class KidsModule {
};
exports.KidsModule = KidsModule;
exports.KidsModule = KidsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            audit_module_1.AuditModule,
        ],
        controllers: [kids_controller_1.KidsController],
        providers: [kids_service_1.KidsService],
        exports: [kids_service_1.KidsService],
    })
], KidsModule);
//# sourceMappingURL=kids.module.js.map