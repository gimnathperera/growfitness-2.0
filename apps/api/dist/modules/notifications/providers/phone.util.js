"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeToE164 = normalizeToE164;
function normalizeToE164(phone, defaultCountryCode = '94') {
    const trimmed = (phone ?? '').trim();
    if (!trimmed)
        return null;
    const digitsOnly = trimmed.replace(/\D/g, '');
    if (!digitsOnly.length)
        return null;
    let normalized;
    if (trimmed.startsWith('+')) {
        normalized = '+' + digitsOnly;
    }
    else if (digitsOnly.startsWith('0')) {
        normalized = '+' + defaultCountryCode + digitsOnly.slice(1);
    }
    else if (digitsOnly.startsWith(defaultCountryCode) && digitsOnly.length > defaultCountryCode.length) {
        normalized = '+' + digitsOnly;
    }
    else {
        normalized = '+' + defaultCountryCode + digitsOnly;
    }
    if (normalized.length < 10 || normalized.length > 16)
        return null;
    return normalized;
}
//# sourceMappingURL=phone.util.js.map