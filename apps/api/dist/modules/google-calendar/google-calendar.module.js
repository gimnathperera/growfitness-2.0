"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const google_calendar_event_schema_1 = require("../../infra/database/schemas/google-calendar-event.schema");
const google_oauth_state_service_1 = require("./google-oauth-state.service");
const google_calendar_oauth_service_1 = require("./google-calendar-oauth.service");
const google_calendar_api_service_1 = require("./google-calendar-api.service");
const google_calendar_sync_service_1 = require("./google-calendar-sync.service");
const google_calendar_auth_controller_1 = require("./google-calendar-auth.controller");
const google_calendar_status_controller_1 = require("./google-calendar-status.controller");
let GoogleCalendarModule = class GoogleCalendarModule {
};
exports.GoogleCalendarModule = GoogleCalendarModule;
exports.GoogleCalendarModule = GoogleCalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
                { name: google_calendar_event_schema_1.GoogleCalendarEvent.name, schema: google_calendar_event_schema_1.GoogleCalendarEventSchema },
            ]),
        ],
        controllers: [google_calendar_auth_controller_1.GoogleCalendarAuthController, google_calendar_status_controller_1.GoogleCalendarStatusController],
        providers: [
            google_oauth_state_service_1.GoogleOAuthStateService,
            google_calendar_oauth_service_1.GoogleCalendarOAuthService,
            google_calendar_api_service_1.GoogleCalendarApiService,
            google_calendar_sync_service_1.GoogleCalendarSyncService,
        ],
        exports: [google_calendar_sync_service_1.GoogleCalendarSyncService],
    })
], GoogleCalendarModule);
//# sourceMappingURL=google-calendar.module.js.map