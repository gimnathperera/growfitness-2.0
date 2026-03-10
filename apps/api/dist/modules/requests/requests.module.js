"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const requests_controller_1 = require("./requests.controller");
const requests_service_1 = require("./requests.service");
const free_session_request_schema_1 = require("../../infra/database/schemas/free-session-request.schema");
const reschedule_request_schema_1 = require("../../infra/database/schemas/reschedule-request.schema");
const extra_session_request_schema_1 = require("../../infra/database/schemas/extra-session-request.schema");
const user_registration_request_schema_1 = require("../../infra/database/schemas/user-registration-request.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
let RequestsModule = class RequestsModule {
};
exports.RequestsModule = RequestsModule;
exports.RequestsModule = RequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: free_session_request_schema_1.FreeSessionRequest.name, schema: free_session_request_schema_1.FreeSessionRequestSchema },
                { name: reschedule_request_schema_1.RescheduleRequest.name, schema: reschedule_request_schema_1.RescheduleRequestSchema },
                { name: extra_session_request_schema_1.ExtraSessionRequest.name, schema: extra_session_request_schema_1.ExtraSessionRequestSchema },
                { name: user_registration_request_schema_1.UserRegistrationRequest.name, schema: user_registration_request_schema_1.UserRegistrationRequestSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
            ]),
            audit_module_1.AuditModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [requests_controller_1.RequestsController],
        providers: [requests_service_1.RequestsService],
        exports: [requests_service_1.RequestsService],
    })
], RequestsModule);
//# sourceMappingURL=requests.module.js.map