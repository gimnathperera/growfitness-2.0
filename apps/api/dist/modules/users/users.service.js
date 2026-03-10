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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const kid_schema_1 = require("../../infra/database/schemas/kid.schema");
const user_registration_request_schema_1 = require("../../infra/database/schemas/user-registration-request.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const shared_types_2 = require("@grow-fitness/shared-types");
const auth_service_1 = require("../auth/auth.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let UsersService = class UsersService {
    userModel;
    kidModel;
    userRegistrationRequestModel;
    authService;
    auditService;
    notificationService;
    constructor(userModel, kidModel, userRegistrationRequestModel, authService, auditService, notificationService) {
        this.userModel = userModel;
        this.kidModel = kidModel;
        this.userRegistrationRequestModel = userRegistrationRequestModel;
        this.authService = authService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async findParents(pagination, search, location, status) {
        const query = { role: shared_types_1.UserRole.PARENT };
        if (status) {
            query.status = status;
        }
        else {
            query.isApproved = true;
        }
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { 'parentProfile.name': { $regex: search, $options: 'i' } },
            ];
        }
        if (location) {
            query['parentProfile.location'] = { $regex: location, $options: 'i' };
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'kids',
                    localField: '_id',
                    foreignField: 'parentId',
                    as: 'kidsData',
                },
            },
            {
                $lookup: {
                    from: 'sessions',
                    let: { kidIds: '$kidsData._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gt: [{ $size: { $setIntersection: ['$kids', '$$kidIds'] } }, 0] },
                                        { $ne: ['$status', 'CANCELLED'] },
                                    ],
                                },
                            },
                        },
                        { $project: { type: 1 } },
                    ],
                    as: 'matchedSessions',
                },
            },
            {
                $addFields: {
                    sessionTypes: {
                        $setUnion: [
                            { $ifNull: ['$kidsData.sessionType', []] },
                            { $ifNull: ['$matchedSessions.type', []] },
                        ],
                    },
                },
            },
            {
                $project: {
                    kidsData: 0,
                    matchedSessions: 0,
                    passwordHash: 0,
                },
            },
            {
                $facet: {
                    data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pagination.limit }],
                    total: [{ $count: 'count' }],
                },
            },
        ];
        const [result] = await this.userModel.aggregate(pipeline).exec();
        const data = result.data;
        const total = result.total[0]?.count || 0;
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findParentById(id, includeUnapproved = false) {
        const query = { _id: id, role: shared_types_1.UserRole.PARENT };
        if (!includeUnapproved) {
            query.isApproved = true;
        }
        const parent = await this.userModel.findOne(query).exec();
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        const kidsQuery = { parentId: new mongoose_2.Types.ObjectId(id) };
        if (!includeUnapproved) {
            kidsQuery.isApproved = true;
        }
        const kids = await this.kidModel.find(kidsQuery).exec();
        return {
            ...parent.toObject(),
            kids,
        };
    }
    async createParent(createParentDto, actorId) {
        const existingUser = await this.userModel
            .findOne({ email: createParentDto.email.toLowerCase() })
            .exec();
        if (existingUser) {
            throw new common_1.ConflictException({
                errorCode: error_codes_enum_1.ErrorCode.DUPLICATE_EMAIL,
                message: 'Email already exists',
            });
        }
        const passwordHash = await this.authService.hashPassword(createParentDto.password);
        const isApproved = actorId !== null;
        const parent = new this.userModel({
            role: shared_types_1.UserRole.PARENT,
            email: createParentDto.email.toLowerCase(),
            phone: createParentDto.phone,
            passwordHash,
            status: shared_types_1.UserStatus.ACTIVE,
            isApproved,
            parentProfile: {
                name: createParentDto.name,
                location: createParentDto.location,
            },
        });
        await parent.save();
        const kids = await Promise.all(createParentDto.kids.map(kidData => {
            const kid = new this.kidModel({
                ...kidData,
                parentId: parent._id,
                birthDate: new Date(kidData.birthDate),
                isApproved,
            });
            return kid.save();
        }));
        if (!isApproved) {
            const registrationRequest = new this.userRegistrationRequestModel({
                parentId: parent._id,
                status: shared_types_1.RequestStatus.PENDING,
            });
            await registrationRequest.save();
            const admins = await this.userModel
                .find({ role: shared_types_1.UserRole.ADMIN })
                .select('_id')
                .lean()
                .exec();
            const requestId = registrationRequest._id.toString();
            const parentName = parent.parentProfile?.name ?? parent.email;
            for (const a of admins) {
                const adminId = a._id?.toString?.();
                if (adminId) {
                    await this.notificationService.createNotification({
                        userId: adminId,
                        type: shared_types_2.NotificationType.USER_REGISTRATION_REQUEST,
                        title: 'New user registration request',
                        body: `${parentName} has requested to join.`,
                        entityType: 'UserRegistrationRequest',
                        entityId: requestId,
                    });
                }
            }
        }
        if (actorId) {
            await this.auditService.log({
                actorId,
                action: 'CREATE_PARENT',
                entityType: 'User',
                entityId: parent._id.toString(),
                metadata: { email: parent.email, kidsCount: kids.length },
            });
        }
        return {
            ...parent.toObject(),
            kids,
        };
    }
    async updateParent(id, updateParentDto, actorId) {
        const parent = await this.userModel.findOne({ _id: id, role: shared_types_1.UserRole.PARENT }).exec();
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        if (updateParentDto.email && updateParentDto.email !== parent.email) {
            const existingUser = await this.userModel
                .findOne({ email: updateParentDto.email.toLowerCase() })
                .exec();
            if (existingUser) {
                throw new common_1.ConflictException({
                    errorCode: error_codes_enum_1.ErrorCode.DUPLICATE_EMAIL,
                    message: 'Email already exists',
                });
            }
        }
        Object.assign(parent, {
            ...(updateParentDto.email && { email: updateParentDto.email.toLowerCase() }),
            ...(updateParentDto.phone && { phone: updateParentDto.phone }),
            ...(updateParentDto.status && { status: updateParentDto.status }),
            ...(updateParentDto.name && {
                parentProfile: {
                    ...parent.parentProfile,
                    name: updateParentDto.name,
                    location: updateParentDto.location || parent.parentProfile?.location,
                },
            }),
        });
        await parent.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_PARENT',
            entityType: 'User',
            entityId: id,
            metadata: updateParentDto,
        });
        return parent;
    }
    async deleteParent(id, actorId) {
        const parent = await this.userModel.findOne({ _id: id, role: shared_types_1.UserRole.PARENT }).exec();
        if (!parent) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Parent not found',
            });
        }
        parent.status = shared_types_1.UserStatus.DELETED;
        await parent.save();
        await this.auditService.log({
            actorId,
            action: 'DELETE_PARENT',
            entityType: 'User',
            entityId: id,
        });
        return { message: 'Parent deleted successfully' };
    }
    async findCoaches(pagination, search) {
        const query = { role: shared_types_1.UserRole.COACH };
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { 'coachProfile.name': { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (pagination.page - 1) * pagination.limit;
        const [data, total] = await Promise.all([
            this.userModel.find(query).skip(skip).limit(pagination.limit).exec(),
            this.userModel.countDocuments(query).exec(),
        ]);
        return new pagination_dto_1.PaginatedResponseDto(data, total, pagination.page, pagination.limit);
    }
    async findCoachById(id) {
        const coach = await this.userModel.findOne({ _id: id, role: shared_types_1.UserRole.COACH }).exec();
        if (!coach) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Coach not found',
            });
        }
        return coach;
    }
    async createCoach(createCoachDto, actorId) {
        const existingUser = await this.userModel
            .findOne({ email: createCoachDto.email.toLowerCase() })
            .exec();
        if (existingUser) {
            throw new common_1.ConflictException({
                errorCode: error_codes_enum_1.ErrorCode.DUPLICATE_EMAIL,
                message: 'Email already exists',
            });
        }
        const passwordHash = await this.authService.hashPassword(createCoachDto.password);
        const coach = new this.userModel({
            role: shared_types_1.UserRole.COACH,
            email: createCoachDto.email.toLowerCase(),
            phone: createCoachDto.phone,
            passwordHash,
            status: shared_types_1.UserStatus.ACTIVE,
            isApproved: true,
            coachProfile: {
                name: createCoachDto.name,
            },
        });
        await coach.save();
        await this.auditService.log({
            actorId,
            action: 'CREATE_COACH',
            entityType: 'User',
            entityId: coach._id.toString(),
            metadata: { email: coach.email },
        });
        return coach;
    }
    async updateCoach(id, updateCoachDto, actorId) {
        const coach = await this.userModel.findOne({ _id: id, role: shared_types_1.UserRole.COACH }).exec();
        if (!coach) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Coach not found',
            });
        }
        if (updateCoachDto.email && updateCoachDto.email !== coach.email) {
            const existingUser = await this.userModel
                .findOne({ email: updateCoachDto.email.toLowerCase() })
                .exec();
            if (existingUser) {
                throw new common_1.ConflictException({
                    errorCode: error_codes_enum_1.ErrorCode.DUPLICATE_EMAIL,
                    message: 'Email already exists',
                });
            }
        }
        Object.assign(coach, {
            ...(updateCoachDto.email && { email: updateCoachDto.email.toLowerCase() }),
            ...(updateCoachDto.phone && { phone: updateCoachDto.phone }),
            ...(updateCoachDto.status && { status: updateCoachDto.status }),
            ...(updateCoachDto.name && {
                coachProfile: {
                    ...coach.coachProfile,
                    name: updateCoachDto.name,
                },
            }),
        });
        await coach.save();
        await this.auditService.log({
            actorId,
            action: 'UPDATE_COACH',
            entityType: 'User',
            entityId: id,
            metadata: updateCoachDto,
        });
        return coach;
    }
    async deactivateCoach(id, actorId) {
        const coach = await this.userModel.findOne({ _id: id, role: shared_types_1.UserRole.COACH }).exec();
        if (!coach) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'Coach not found',
            });
        }
        coach.status = shared_types_1.UserStatus.INACTIVE;
        await coach.save();
        await this.auditService.log({
            actorId,
            action: 'DEACTIVATE_COACH',
            entityType: 'User',
            entityId: id,
        });
        return { message: 'Coach deactivated successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(kid_schema_1.Kid.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_registration_request_schema_1.UserRegistrationRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        auth_service_1.AuthService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationService])
], UsersService);
//# sourceMappingURL=users.service.js.map