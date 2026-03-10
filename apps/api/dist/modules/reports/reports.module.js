"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const report_schema_1 = require("../../infra/database/schemas/report.schema");
const audit_module_1 = require("../audit/audit.module");
const sessions_module_1 = require("../sessions/sessions.module");
const invoices_module_1 = require("../invoices/invoices.module");
const kids_module_1 = require("../kids/kids.module");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const session_schema_1 = require("../../infra/database/schemas/session.schema");
const invoice_schema_1 = require("../../infra/database/schemas/invoice.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const location_schema_1 = require("../../infra/database/schemas/location.schema");
let ReportsModule = class ReportsModule {
};
exports.ReportsModule = ReportsModule;
exports.ReportsModule = ReportsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: report_schema_1.Report.name, schema: report_schema_1.ReportSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: session_schema_1.Session.name, schema: session_schema_1.SessionSchema },
                { name: invoice_schema_1.Invoice.name, schema: invoice_schema_1.InvoiceSchema },
                { name: kid_schema_1.Kid.name, schema: kid_schema_1.KidSchema },
                { name: location_schema_1.Location.name, schema: location_schema_1.LocationSchema },
            ]),
            audit_module_1.AuditModule,
            sessions_module_1.SessionsModule,
            invoices_module_1.InvoicesModule,
            kids_module_1.KidsModule,
        ],
        controllers: [reports_controller_1.ReportsController],
        providers: [reports_service_1.ReportsService],
        exports: [reports_service_1.ReportsService],
    })
], ReportsModule);
//# sourceMappingURL=reports.module.js.map