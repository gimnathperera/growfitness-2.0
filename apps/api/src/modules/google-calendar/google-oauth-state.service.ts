import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ErrorCode } from '../../common/enums/error-codes.enum';

type StatePayload = {
  userId: string;
  redirectUri: string;
  exp: number;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string) {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input + '='.repeat(padLength);
  const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf8');
}

@Injectable()
export class GoogleOAuthStateService {
  constructor(private configService: ConfigService) {}

  private getSecret() {
    return (
      this.configService.get<string>('GOOGLE_OAUTH_STATE_SECRET') ||
      this.configService.get<string>('JWT_SECRET', 'default-secret')
    );
  }

  sign(payload: { userId: string; redirectUri: string }, ttlMs: number) {
    const exp = Date.now() + ttlMs;
    const full: StatePayload = { ...payload, exp };
    const body = base64UrlEncode(JSON.stringify(full));

    const sig = crypto
      .createHmac('sha256', this.getSecret())
      .update(body)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${body}.${sig}`;
  }

  verify(state: string): StatePayload {
    const [body, sig] = state.split('.');
    if (!body || !sig) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Invalid OAuth state',
      });
    }

    const expected = crypto
      .createHmac('sha256', this.getSecret())
      .update(body)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Invalid OAuth state signature',
      });
    }

    const payload = JSON.parse(base64UrlDecode(body)) as StatePayload;
    if (!payload?.userId || !payload?.redirectUri || !payload?.exp) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'Invalid OAuth state payload',
      });
    }

    if (Date.now() > payload.exp) {
      throw new UnauthorizedException({
        errorCode: ErrorCode.UNAUTHORIZED,
        message: 'OAuth state expired',
      });
    }

    return payload;
  }
}

