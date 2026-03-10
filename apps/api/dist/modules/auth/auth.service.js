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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2 = require("argon2");
const crypto = require("crypto");
const user_schema_1 = require("../../infra/database/schemas/user.schema");
const password_reset_token_schema_1 = require("../../infra/database/schemas/password-reset-token.schema");
const shared_types_1 = require("@grow-fitness/shared-types");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    userModel;
    passwordResetTokenModel;
    jwtService;
    configService;
    notificationService;
    constructor(userModel, passwordResetTokenModel, jwtService, configService, notificationService) {
        this.userModel = userModel;
        this.passwordResetTokenModel = passwordResetTokenModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationService = notificationService;
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (!user) {
            return null;
        }
        if (user.status !== shared_types_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'Account is not active',
            });
        }
        if (!user.isApproved) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'Your account creation is under review',
            });
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.INVALID_CREDENTIALS,
                message: 'Invalid email or password',
            });
        }
        const payload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'default-refresh-secret'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET', 'default-refresh-secret'),
            });
            const user = await this.userModel.findById(payload.sub).exec();
            if (!user || user.status !== shared_types_1.UserStatus.ACTIVE) {
                throw new common_1.UnauthorizedException({
                    errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                    message: 'Invalid refresh token',
                });
            }
            if (!user.isApproved) {
                throw new common_1.UnauthorizedException({
                    errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                    message: 'Your account creation is under review',
                });
            }
            const newPayload = {
                sub: user._id.toString(),
                email: user.email,
                role: user.role,
            };
            return {
                accessToken: this.jwtService.sign(newPayload),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.TOKEN_INVALID,
                message: 'Invalid refresh token',
            });
        }
    }
    async hashPassword(password) {
        return argon2.hash(password);
    }
    async requestPasswordReset(email) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (!user || user.status !== shared_types_1.UserStatus.ACTIVE) {
            return;
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expirySeconds = parseInt(this.configService.get('PASSWORD_RESET_TOKEN_EXPIRY', '3600'), 10);
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expirySeconds);
        await this.passwordResetTokenModel
            .updateMany({ userId: user._id, used: false }, { used: true })
            .exec();
        await this.passwordResetTokenModel.create({
            userId: user._id,
            token,
            expiresAt,
            used: false,
        });
        try {
            await this.notificationService.sendPasswordResetEmail(user, token);
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }
    async resetPassword(token, newPassword) {
        const resetToken = await this.passwordResetTokenModel
            .findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        })
            .exec();
        if (!resetToken) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.TOKEN_INVALID,
                message: 'Invalid or expired reset token',
            });
        }
        const user = await this.userModel.findById(resetToken.userId).exec();
        if (!user) {
            throw new common_1.NotFoundException({
                errorCode: error_codes_enum_1.ErrorCode.USER_NOT_FOUND,
                message: 'User not found',
            });
        }
        if (user.status !== shared_types_1.UserStatus.ACTIVE) {
            throw new common_1.BadRequestException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'Account is not active',
            });
        }
        const passwordHash = await this.hashPassword(newPassword);
        user.passwordHash = passwordHash;
        await user.save();
        resetToken.used = true;
        await resetToken.save();
    }
    async validateResetToken(token) {
        const resetToken = await this.passwordResetTokenModel
            .findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        })
            .exec();
        if (!resetToken) {
            return null;
        }
        const user = await this.userModel.findById(resetToken.userId).exec();
        if (!user || user.status !== shared_types_1.UserStatus.ACTIVE) {
            return null;
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(password_reset_token_schema_1.PasswordResetToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationService])
], AuthService);
//# sourceMappingURL=auth.service.js.map