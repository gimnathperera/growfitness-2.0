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
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const location_schema_1 = require("../../infra/database/schemas/location.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let LocationsService = class LocationsService {
    locationModel;
    auditService;
    constructor(locationModel, auditService) {
        this.locationModel = locationModel;
        this.auditService = auditService;
    }
    async findAll(pagination) {
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.locationModel.find().sort({ name: 1 }).skip(skip).limit(pagination.limit).exec(),
            this.locationModel.countDocuments().exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const location = await this.locationModel.findById(id).exec();
        if (!location) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.LOCATION_NOT_FOUND,
                message: 'Location not found',
            });
        }
        return location;
    }
    async create(createLocationDto, actorId) {
        const location = new this.locationModel(createLocationDto);
        await location.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_LOCATION',
            entityType: 'Location',
            entityId: location._id.toString(),
            metadata: createLocationDto,
        });
        return location;
    }
    async update(id, updateLocationDto, actorId) {
        const location = await this.locationModel.findById(id).exec();
        if (!location) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.LOCATION_NOT_FOUND,
                message: 'Location not found',
            });
        }
        Object.assign(location, updateLocationDto);
        await location.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_LOCATION',
            entityType: 'Location',
            entityId: id,
            metadata: updateLocationDto,
        });
        return location;
    }
    async delete(id, actorId) {
        const location = await this.locationModel.findById(id).exec();
        if (!location) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.LOCATION_NOT_FOUND,
                message: 'Location not found',
            });
        }
        await this.locationModel.deleteOne({ _id: id }).exec();
        await this.auditService.log({
            actorId,
            action: 'DELETE_LOCATION',
            entityType: 'Location',
            entityId: id,
        });
        return { message: 'Location deleted successfully' };
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(location_schema_1.Location.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_service_1.AuditService])
], LocationsService);
//# sourceMappingURL=locations.service.js.map