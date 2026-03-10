"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./infra/database/database.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const kids_module_1 = require("./modules/kids/kids.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const requests_module_1 = require("./modules/requests/requests.module");
const locations_module_1 = require("./modules/locations/locations.module");
const banners_module_1 = require("./modules/banners/banners.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const audit_module_1 = require("./modules/audit/audit.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const codes_module_1 = require("./modules/codes/codes.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const reports_module_1 = require("./modules/reports/reports.module");
const testimonials_module_1 = require("./modules/testimonials/testimonials.module");
const reminders_module_1 = require("./modules/reminders/reminders.module");
const support_chat_module_1 = require("./modules/support-chat/support-chat.module");
const google_calendar_module_1 = require("./modules/google-calendar/google-calendar.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: () => ({
                    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/grow-fitness',
                }),
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            kids_module_1.KidsModule,
            sessions_module_1.SessionsModule,
            invoices_module_1.InvoicesModule,
            requests_module_1.RequestsModule,
            locations_module_1.LocationsModule,
            banners_module_1.BannersModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            dashboard_module_1.DashboardModule,
            codes_module_1.CodesModule,
            quizzes_module_1.QuizzesModule,
            reports_module_1.ReportsModule,
            testimonials_module_1.TestimonialsModule,
            reminders_module_1.RemindersModule,
            support_chat_module_1.SupportChatModule,
            google_calendar_module_1.GoogleCalendarModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: transform_interceptor_1.TransformInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map