import { normalizeToE164 } from './phone.util';

describe('normalizeToE164', () => {
  it('returns null for empty or whitespace', () => {
    expect(normalizeToE164('')).toBeNull();
    expect(normalizeToE164('   ')).toBeNull();
    expect(normalizeToE164(null as unknown as string)).toBeNull();
  });

  it('normalizes number starting with 0 using default country code', () => {
    expect(normalizeToE164('0771234567')).toBe('+94771234567');
    expect(normalizeToE164('077 123 4567')).toBe('+94771234567');
    expect(normalizeToE164('077-123-4567')).toBe('+94771234567');
  });

  it('uses custom default country code', () => {
    expect(normalizeToE164('0771234567', '44')).toBe('+44771234567');
    expect(normalizeToE164('0771234567', '1')).toBe('+1771234567');
  });

  it('keeps number already with +', () => {
    expect(normalizeToE164('+94771234567')).toBe('+94771234567');
    expect(normalizeToE164('+94 77 123 4567')).toBe('+94771234567');
  });

  it('adds + and country when digits only with country code', () => {
    expect(normalizeToE164('94771234567')).toBe('+94771234567');
  });

  it('returns null for too short or too long', () => {
    expect(normalizeToE164('123')).toBeNull();
    expect(normalizeToE164('+12345678901234567')).toBeNull();
  });

  it('returns null when only non-digits', () => {
    expect(normalizeToE164('abc')).toBeNull();
    expect(normalizeToE164('---')).toBeNull();
  });
});
