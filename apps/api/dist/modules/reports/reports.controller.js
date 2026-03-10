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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const shared_types_1 = require("@grow-fitness/shared-types");
const reports_service_1 = require("./reports.service");
const create_report_dto_1 = require("./dto/create-report.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const objectid_validation_pipe_1 = require("../../common/pipes/objectid-validation.pipe");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    findAll(pagination, type) {
        return this.reportsService.findAll(pagination, type);
    }
    findById(id) {
        return this.reportsService.findById(id);
    }
    create(createReportDto, actorId) {
        return this.reportsService.create(createReportDto, actorId);
    }
    generate(generateReportDto, actorId) {
        return this.reportsService.generate(generateReportDto, actorId);
    }
    delete(id, actorId) {
        return this.reportsService.delete(id, actorId);
    }
    async exportCSV(id, res) {
        const csv = await this.reportsService.exportCSV(id);
        const report = await this.reportsService.findById(id);
        const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reports' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of reports' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get report by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new report' }),
    (0, swagger_1.ApiBody)({ type: create_report_dto_1.CreateReportDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Report created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report generated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "generate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('sub')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/export/csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Export report as CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSV file' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Report not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format or report not generated' }),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="report.csv"'),
    __param(0, (0, common_1.Param)('id', objectid_validation_pipe_1.ObjectIdValidationPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportCSV", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(shared_types_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map