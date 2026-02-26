import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from '../../infra/database/schemas/password-reset-token.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import { LoginDto } from '@grow-fitness/shared-schemas';
import { ErrorCode } from '../../common/enums/error-codes.enum';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationService: NotificationService
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();

    if (!user) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Account is not active',
      });
    }

    if (!user.isApproved) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Your account creation is under review',
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
      });
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
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

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      });

      const user = await this.userModel.findById(payload.sub).exec();

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException({
          errorCode: ErrorCode.UNAUTHORIZED,
          message: 'Invalid refresh token',
        });
      }

      if (!user.isApproved) {
        throw new UnauthorizedException({
          errorCode: ErrorCode.UNAUTHORIZED,
          message: 'Your account creation is under review',
        });
      }

      const newPayload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.TOKEN_INVALID,
        message: 'Invalid refresh token',
      });
    }
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();

    // Security: Always return success to prevent email enumeration
    if (!user || user.status !== UserStatus.ACTIVE) {
      return;
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiry time (default: 1 hour)
    const expirySeconds = parseInt(
      this.configService.get<string>('PASSWORD_RESET_TOKEN_EXPIRY', '3600'),
      10
    );
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirySeconds);

    // Invalidate any existing tokens for this user
    await this.passwordResetTokenModel
      .updateMany({ userId: user._id, used: false }, { used: true })
      .exec();

    // Create new reset token
    await this.passwordResetTokenModel.create({
      userId: user._id,
      token,
      expiresAt,
      used: false,
    });

    // Send password reset email
    try {
      await this.notificationService.sendPasswordResetEmail(user, token);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset email:', error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find token in database
    const resetToken = await this.passwordResetTokenModel
      .findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .exec();

    if (!resetToken) {
      throw new BadRequestException({
        errorCode: ErrorCode.TOKEN_INVALID,
        message: 'Invalid or expired reset token',
      });
    }

    // Find user
    const user = await this.userModel.findById(resetToken.userId).exec();

    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Account is not active',
      });
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user password
    user.passwordHash = passwordHash;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();
  }

  async validateResetToken(token: string): Promise<UserDocument | null> {
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

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }
}
