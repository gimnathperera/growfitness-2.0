import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../infra/database/schemas/user.schema';
import { PasswordResetTokenDocument } from '../../infra/database/schemas/password-reset-token.schema';
import { UserRole } from '@grow-fitness/shared-types';
import { LoginDto } from '@grow-fitness/shared-schemas';
import { NotificationService } from '../notifications/notifications.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}
export declare class AuthService {
    private userModel;
    private passwordResetTokenModel;
    private jwtService;
    private configService;
    private notificationService;
    constructor(userModel: Model<UserDocument>, passwordResetTokenModel: Model<PasswordResetTokenDocument>, jwtService: JwtService, configService: ConfigService, notificationService: NotificationService);
    validateUser(email: string, password: string): Promise<UserDocument | null>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    hashPassword(password: string): Promise<string>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    validateResetToken(token: string): Promise<UserDocument | null>;
}
