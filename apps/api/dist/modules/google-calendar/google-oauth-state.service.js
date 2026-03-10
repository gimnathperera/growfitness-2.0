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
exports.GoogleOAuthStateService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
function base64UrlEncode(input) {
    return Buffer.from(input, 'utf8')
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function base64UrlDecode(input) {
    const padLength = (4 - (input.length % 4)) % 4;
    const padded = input + '='.repeat(padLength);
    const b64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(b64, 'base64').toString('utf8');
}
let GoogleOAuthStateService = class GoogleOAuthStateService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getSecret() {
        return (this.configService.get('GOOGLE_OAUTH_STATE_SECRET') ||
            this.configService.get('JWT_SECRET', 'default-secret'));
    }
    sign(payload, ttlMs) {
        const exp = Date.now() + ttlMs;
        const full = { ...payload, exp };
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
    verify(state) {
        const [body, sig] = state.split('.');
        if (!body || !sig) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
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
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'Invalid OAuth state signature',
            });
        }
        const payload = JSON.parse(base64UrlDecode(body));
        if (!payload?.userId || !payload?.redirectUri || !payload?.exp) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'Invalid OAuth state payload',
            });
        }
        if (Date.now() > payload.exp) {
            throw new common_1.UnauthorizedException({
                errorCode: error_codes_enum_1.ErrorCode.UNAUTHORIZED,
                message: 'OAuth state expired',
            });
        }
        return payload;
    }
};
exports.GoogleOAuthStateService = GoogleOAuthStateService;
exports.GoogleOAuthStateService = GoogleOAuthStateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleOAuthStateService);
//# sourceMappingURL=google-oauth-state.service.js.map