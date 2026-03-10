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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sessions_service_1 = require("../sessions/sessions.service");
const requests_service_1 = require("../requests/requests.service");
const invoices_service_1 = require("../invoices/invoices.service");
const audit_service_1 = require("../audit/audit.service");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
let DashboardService = class DashboardService {
    userModel;
    kidModel;
    sessionsService;
    requestsService;
    invoicesService;
    auditService;
    constructor(userModel, kidModel, sessionsService, requestsService, invoicesService, auditService) {
        this.userModel = userModel;
        this.kidModel = kidModel;
        this.sessionsService = sessionsService;
        this.requestsService = requestsService;
        this.invoicesService = invoicesService;
        this.auditService = auditService;
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [todaysSessions, freeSessionRequests, rescheduleRequests, totalParents, totalCoaches, totalKids,] = await Promise.all([
            this.sessionsService.findByDateRange(today, tomorrow),
            this.requestsService.countFreeSessionRequests(),
            this.requestsService.countRescheduleRequests(),
            this.userModel.countDocuments({ role: shared_types_1.UserRole.PARENT }).exec(),
            this.userModel.countDocuments({ role: shared_types_1.UserRole.COACH }).exec(),
            this.kidModel.countDocuments().exec(),
        ]);
        return {
            todaysSessions: todaysSessions.length,
            freeSessionRequests: freeSessionRequests,
            freeSessionRequestsCount: freeSessionRequests,
            rescheduleRequests: rescheduleRequests,
            rescheduleRequestsCount: rescheduleRequests,
            totalParents,
            totalCoaches,
            totalKids,
            todaysSessionsList: todaysSessions,
        };
    }
    async getWeeklySessions() {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return this.sessionsService.getWeeklySummary(startOfWeek, endOfWeek);
    }
    async getFinanceSummary() {
        return this.invoicesService.getFinanceSummary();
    }
    async getActivityLogs(pagination) {
        return this.auditService.findAll(pagination);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        sessions_service_1.SessionsService,
        requests_service_1.RequestsService,
        invoices_service_1.InvoicesService,
        audit_service_1.AuditService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map