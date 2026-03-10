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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const audit_log_schema_1 = require("../../infra/database/schemas/audit-log.schema");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let AuditService = class AuditService {
    auditLogModel;
    constructor(auditLogModel) {
        this.auditLogModel = auditLogModel;
    }
    async populateActorId(log) {
        try {
            const UserModel = this.auditLogModel.db.model('User');
            let userId = null;
            if (log.actorId && typeof log.actorId === 'object') {
                const actorIdObj = log.actorId;
                if ('sub' in actorIdObj && actorIdObj.sub && mongoose_2.Types.ObjectId.isValid(actorIdObj.sub)) {
                    userId = actorIdObj.sub;
                }
                else {
                    const actorIdStr = String(log.actorId);
                    if (mongoose_2.Types.ObjectId.isValid(actorIdStr)) {
                        userId = actorIdStr;
                    }
                    else if (log.actorId instanceof mongoose_2.Types.ObjectId) {
                        userId = log.actorId.toString();
                    }
                }
            }
            else if (log.actorId &&
                typeof log.actorId === 'string' &&
                mongoose_2.Types.ObjectId.isValid(log.actorId)) {
                userId = log.actorId;
            }
            if (userId) {
                const user = await UserModel.findById(userId).select('email role').lean().exec();
                return {
                    ...log,
                    actorId: user || null,
                };
            }
            return {
                ...log,
                actorId: null,
            };
        }
        catch {
            return {
                ...log,
                actorId: null,
            };
        }
    }
    async log(data) {
        let actorId;
        if (typeof data.actorId === 'string') {
            actorId = data.actorId;
        }
        else if (data.actorId && typeof data.actorId === 'object' && 'sub' in data.actorId) {
            actorId = data.actorId.sub;
        }
        else {
            throw new common_1.HttpException('Invalid actorId format', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!mongoose_2.Types.ObjectId.isValid(actorId)) {
            throw new common_1.HttpException('Invalid actorId format: must be a valid ObjectId', common_1.HttpStatus.BAD_REQUEST);
        }
        const auditLog = new this.auditLogModel({
            ...data,
            actorId: new mongoose_2.Types.ObjectId(actorId),
            timestamp: new Date(),
        });
        await auditLog.save();
        return auditLog;
    }
    async findAll(pagination, filters) {
        try {
            const query = {};
            if (filters?.actorId) {
                if (mongoose_2.Types.ObjectId.isValid(filters.actorId)) {
                    query.actorId = new mongoose_2.Types.ObjectId(filters.actorId);
                }
                else {
                    throw new common_1.HttpException('Invalid actorId format', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            if (filters?.entityType) {
                query.entityType = filters.entityType;
            }
            if (filters?.startDate || filters?.endDate) {
                const timestampQuery = {};
                if (filters.startDate) {
                    timestampQuery.$gte = filters.startDate;
                }
                if (filters.endDate) {
                    timestampQuery.$lte = filters.endDate;
                }
                query.timestamp = timestampQuery;
            }
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const skip = (page - 1) * limit;
            const rawData = await this.auditLogModel
                .find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
            const transformedData = await Promise.all(rawData.map(log => this.populateActorId(log)));
            const total = await this.auditLogModel.countDocuments(query).exec();
            return new pagination_dto_1.PaginatedResponseDto(transformedData, total, page, limit);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to fetch audit logs: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRecentLogs(limit = 10) {
        try {
            const rawData = await this.auditLogModel
                .find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean()
                .exec();
            const transformedData = await Promise.all(rawData.map(log => this.populateActorId(log)));
            return transformedData;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to fetch recent audit logs: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(audit_log_schema_1.AuditLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuditService);
//# sourceMappingURL=audit.service.js.map