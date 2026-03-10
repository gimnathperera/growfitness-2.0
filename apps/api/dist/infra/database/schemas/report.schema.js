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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSchema = exports.Report = exports.ReportStatus = exports.ReportType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var ReportType;
(function (ReportType) {
    ReportType["ATTENDANCE"] = "ATTENDANCE";
    ReportType["PERFORMANCE"] = "PERFORMANCE";
    ReportType["FINANCIAL"] = "FINANCIAL";
    ReportType["SESSION_SUMMARY"] = "SESSION_SUMMARY";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "PENDING";
    ReportStatus["GENERATED"] = "GENERATED";
    ReportStatus["FAILED"] = "FAILED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
let Report = class Report {
    type;
    title;
    description;
    status;
    startDate;
    endDate;
    filters;
    data;
    fileUrl;
    generatedAt;
};
exports.Report = Report;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: ReportType }),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Report.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Report.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, enum: ReportStatus, default: ReportStatus.PENDING }),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Report.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Report.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: false }),
    __metadata("design:type", Object)
], Report.prototype, "filters", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: false }),
    __metadata("design:type", Object)
], Report.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Report.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Report.prototype, "generatedAt", void 0);
exports.Report = Report = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Report);
exports.ReportSchema = mongoose_1.SchemaFactory.createForClass(Report);
exports.ReportSchema.index({ type: 1 });
exports.ReportSchema.index({ status: 1 });
exports.ReportSchema.index({ startDate: 1, endDate: 1 });
exports.ReportSchema.index({ createdAt: -1 });
//# sourceMappingURL=report.schema.js.map