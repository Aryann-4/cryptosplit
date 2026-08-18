import { describe, it, expect } from 'vitest';
import {
  generateSecret,
  bytesToHex,
  hexToBytes,
  bytesEqual,
  getMemberId,
  getDebtKey,
} from '../crypto.js';

describe('generateSecret', () => {
  it('generates 32-byte random secret', () => {
    const secret = generateSecret();
    expect(secret.length).toBe(32);
  });

  it('generates different secrets each call', () => {
    const s1 = generateSecret();
    const s2 = generateSecret();
    expect(bytesEqual(s1, s2)).toBe(false);
  });
});

describe('bytesToHex / hexToBytes', () => {
  it('roundtrips correctly', () => {
    const original = new Uint8Array([0, 1, 128, 255, 16, 32]);
    const hex = bytesToHex(original);
    const restored = hexToBytes(hex);
    expect(bytesEqual(original, restored)).toBe(true);
  });

  it('produces correct hex for known values', () => {
    const bytes = new Uint8Array([255, 171, 192]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe('ffabc0');
  });

  it('pads single digits', () => {
    const bytes = new Uint8Array([0, 1, 15]);
    const hex = bytesToHex(bytes);
    expect(hex).toBe('00010f');
  });
});

describe('bytesEqual', () => {
  it('returns true for identical arrays', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    expect(bytesEqual(a, b)).toBe(true);
  });

  it('returns false for different arrays', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 4]);
    expect(bytesEqual(a, b)).toBe(false);
  });

  it('returns false for different lengths', () => {
    const a = new Uint8Array([1, 2]);
    const b = new Uint8Array([1, 2, 3]);
    expect(bytesEqual(a, b)).toBe(false);
  });
});

describe('getMemberId', () => {
  it('returns 32-byte commitment', () => {
    const secret = generateSecret();
    const memberId = getMemberId(secret);
    expect(memberId.length).toBe(32);
  });

  it('returns same ID for same secret', () => {
    const secret = new Uint8Array(32).fill(42);
    const id1 = getMemberId(secret);
    const id2 = getMemberId(secret);
    expect(bytesEqual(id1, id2)).toBe(true);
  });

  it('returns different IDs for different secrets', () => {
    const s1 = new Uint8Array(32).fill(1);
    const s2 = new Uint8Array(32).fill(2);
    const id1 = getMemberId(s1);
    const id2 = getMemberId(s2);
    expect(bytesEqual(id1, id2)).toBe(false);
  });
});

describe('getDebtKey', () => {
  it('returns 32-byte key', () => {
    const a = generateSecret();
    const b = generateSecret();
    const key = getDebtKey(a, b);
    expect(key.length).toBe(32);
  });

  it('produces different keys for different pairs', () => {
    const a = new Uint8Array(32).fill(1);
    const b = new Uint8Array(32).fill(2);
    const c = new Uint8Array(32).fill(3);

    const keyAB = getDebtKey(a, b);
    const keyAC = getDebtKey(a, c);
    expect(bytesEqual(keyAB, keyAC)).toBe(false);
  });

  it('order matters (debtor, creditor)', () => {
    const a = new Uint8Array(32).fill(1);
    const b = new Uint8Array(32).fill(2);

    const keyAB = getDebtKey(a, b);
    const keyBA = getDebtKey(b, a);
    expect(bytesEqual(keyAB, keyBA)).toBe(false);
  });
});
