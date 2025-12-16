import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { User, UserDocument } from '../../infra/database/schemas/user.schema';
import { UserRole, UserStatus } from '@grow-fitness/shared-types';
import { LoginDto } from '@grow-fitness/shared-schemas';
import { ErrorCode } from '../../common/enums/error-codes.enum';

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
    private jwtService: JwtService,
    private configService: ConfigService
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
      }) as JwtPayload;

      const user = await this.userModel.findById(payload.sub).exec();

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException({
          errorCode: ErrorCode.UNAUTHORIZED,
          message: 'Invalid refresh token',
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
}

