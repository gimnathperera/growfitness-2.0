"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemindersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const invoice_schema_1 = require("../../infra/database/schemas/invoice.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const reminders_service_1 = require("./reminders.service");
const notifications_module_1 = require("../notifications/notifications.module");
let RemindersModule = class RemindersModule {
};
exports.RemindersModule = RemindersModule;
exports.RemindersModule = RemindersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
            ]),
            notifications_module_1.NotificationsModule,
        ],
        providers: [reminders_service_1.RemindersService],
    })
], RemindersModule);
//# sourceMappingURL=reminders.module.js.map