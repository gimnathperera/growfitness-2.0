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
exports.KidsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const audit_service_1 = require("../audit/audit.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let KidsService = class KidsService {
    kidModel;
    userModel;
    auditService;
    constructor(kidModel, userModel, auditService) {
        this.kidModel = kidModel;
        this.userModel = userModel;
        this.auditService = auditService;
    }
    async findAll(pagination, parentId, sessionType, search) {
        const query = { isApproved: true };
        if (parentId) {
            query.parentId = new mongoose_2.Types.ObjectId(parentId);
        }
        if (sessionType) {
            query.sessionType = sessionType;
        }
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: searchRegex }, { goal: searchRegex }];
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.kidModel
                .find(query)
                .populate('parentId', 'email parentProfile coachProfile')
                .skip(skip)
                .limit(pagination.limit)
                .lean()
                .exec(),
            this.kidModel.countDocuments(query).exec(),
        ]);
        const transformedData = data.map((kid) => {
            const { parentId, ...rest } = kid;
            return {
                ...rest,
                parent: parentId || undefined,
            };
        });
        return new pagination_dto_1.PaginatedResponseDto(transformedData, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const kid = await this.kidModel
            .findOne({ _id: id, isApproved: true })
            .populate('parentId', 'email parentProfile coachProfile')
            .lean()
            .exec();
        if (!kid) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.KID_NOT_FOUND,
                message: 'Kid not found',
            });
        }
        const { parentId, ...rest } = kid;
        return {
            ...rest,
            parent: parentId || undefined,
        };
    }
    async create(createKidDto, actorId) {
        const parent = await this.userModel.findById(createKidDto.parentId).exec();
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        const isApproved = parent.isApproved !== false;
        const kid = new this.kidModel({
            ...createKidDto,
            parentId: parent._id,
            birthDate: new Date(createKidDto.birthDate),
            medicalConditions: createKidDto.medicalConditions || [],
            isApproved,
        });
        await kid.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_KID',
            entityType: 'Kid',
            entityId: kid._id.toString(),
            metadata: { name: kid.name, parentId: parent._id.toString() },
        });
        const createdKid = await this.kidModel
            .findById(kid._id)
            .populate('parentId', 'email parentProfile coachProfile')
            .lean()
            .exec();
        if (!createdKid) {
            return kid;
        }
        const { parentId, ...rest } = createdKid;
        return {
            ...rest,
            parent: parentId || undefined,
        };
    }
    async update(id, updateKidDto, actorId) {
        const kid = await this.kidModel.findById(id).exec();
        if (!kid) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.KID_NOT_FOUND,
                message: 'Kid not found',
            });
        }
        Object.assign(kid, {
            ...(updateKidDto.name && { name: updateKidDto.name }),
            ...(updateKidDto.gender && { gender: updateKidDto.gender }),
            ...(updateKidDto.birthDate && { birthDate: new Date(updateKidDto.birthDate) }),
            ...(updateKidDto.goal !== undefined && { goal: updateKidDto.goal }),
            ...(updateKidDto.currentlyInSports !== undefined && {
                currentlyInSports: updateKidDto.currentlyInSports,
            }),
            ...(updateKidDto.medicalConditions && { medicalConditions: updateKidDto.medicalConditions }),
            ...(updateKidDto.sessionType && { sessionType: updateKidDto.sessionType }),
        });
        await kid.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_KID',
            entityType: 'Kid',
            entityId: id,
            metadata: updateKidDto,
        });
        const updatedKid = await this.kidModel
            .findById(id)
            .populate('parentId', 'email parentProfile coachProfile')
            .lean()
            .exec();
        if (!updatedKid) {
            return kid;
        }
        const { parentId, ...rest } = updatedKid;
        return {
            ...rest,
            parent: parentId || undefined,
        };
    }
    async linkToParent(kidId, parentId, actorId) {
        const [kid, parent] = await Promise.all([
            this.kidModel.findById(kidId).exec(),
            this.userModel.findById(parentId).exec(),
        ]);
        if (!kid) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.KID_NOT_FOUND,
                message: 'Kid not found',
            });
        }
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        kid.parentId = parent._id;
        await kid.save();
        await this.auditService.log({
            actorId,
            action: 'LINK_KID_TO_PARENT',
            entityType: 'Kid',
            entityId: kidId,
            metadata: { parentId },
        });
        const updatedKid = await this.kidModel
            .findById(kidId)
            .populate('parentId', 'email parentProfile coachProfile')
            .lean()
            .exec();
        if (!updatedKid) {
            return kid;
        }
        const { parentId: updatedParentId, ...rest } = updatedKid;
        return {
            ...rest,
            parent: updatedParentId || undefined,
        };
    }
    async unlinkFromParent(kidId, actorId) {
        const kid = await this.kidModel.findById(kidId).exec();
        if (!kid) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.KID_NOT_FOUND,
                message: 'Kid not found',
            });
        }
        kid.parentId = null;
        await kid.save();
        await this.auditService.log({
            actorId,
            action: 'UNLINK_KID_FROM_PARENT',
            entityType: 'Kid',
            entityId: kidId,
        });
        const updatedKid = await this.kidModel.findById(kidId).lean().exec();
        if (!updatedKid) {
            return kid;
        }
        const { parentId, ...rest } = updatedKid;
        return {
            ...rest,
            parent: undefined,
        };
    }
};
exports.KidsService = KidsService;
exports.KidsService = KidsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        audit_service_1.AuditService])
], KidsService);
//# sourceMappingURL=kids.service.js.map