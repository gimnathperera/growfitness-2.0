"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const sessions_controller_1 = require("./sessions.controller");
const sessions_service_1 = require("./sessions.service");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const google_calendar_module_1 = require("../google-calendar/google-calendar.module");
let SessionsModule = class SessionsModule {
};
exports.SessionsModule = SessionsModule;
exports.SessionsModule = SessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
            google_calendar_module_1.GoogleCalendarModule,
        ],
        controllers: [sessions_controller_1.SessionsController],
        providers: [sessions_service_1.SessionsService],
        exports: [sessions_service_1.SessionsService],
    })
], SessionsModule);
//# sourceMappingURL=sessions.module.js.map