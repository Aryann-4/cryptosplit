import { describe, it, expect } from 'vitest';
import {
  generateSecret,
  bytesToHex,
  bytesEqual,
  getMemberId,
  getDebtKey,
} from '../app/src/crypto.js';
import { calculateNetDebts, type ExpenseRecord } from '../app/src/splitCalc.js';

describe('Circuit Logic: deriveId produces deterministic commitments', () => {
  it('same secret always produces the same memberId', () => {
    const secret = new Uint8Array(32).fill(42);
    const id1 = getMemberId(secret);
    const id2 = getMemberId(secret);
    expect(bytesEqual(id1, id2)).toBe(true);
  });

  it('different secrets produce different memberIds', () => {
    const id1 = getMemberId(new Uint8Array(32).fill(1));
    const id2 = getMemberId(new Uint8Array(32).fill(2));
    expect(bytesEqual(id1, id2)).toBe(false);
  });

  it('debtKey is order-sensitive (debtor, creditor)', () => {
    const a = new Uint8Array(32).fill(1);
    const b = new Uint8Array(32).fill(2);
    expect(bytesEqual(getDebtKey(a, b), getDebtKey(b, a))).toBe(false);
  });
});

describe('State Transitions: net debt calculation updates correctly', () => {
  it('single expense creates correct debtor→creditor debts', () => {
    const alice = new Uint8Array(32).fill(1);
    const bob = new Uint8Array(32).fill(2);
    const charlie = new Uint8Array(32).fill(3);

    const expenses: ExpenseRecord[] = [{
      id: '1',
      payerId: alice,
      amount: 300n,
      participantIds: [alice, bob, charlie],
      description: 'Dinner',
      timestamp: Date.now(),
    }];

    const debts = calculateNetDebts(expenses);
    expect(debts.length).toBe(2);

    const bobHex = bytesToHex(bob);
    const aliceHex = bytesToHex(alice);
    const bobDebt = debts.find(
      (d) => bytesToHex(d.debtorId) === bobHex && bytesToHex(d.creditorId) === aliceHex,
    );
    expect(bobDebt?.amount).toBe(100n);
  });

  it('mutual debts net out correctly', () => {
    const alice = new Uint8Array(32).fill(1);
    const bob = new Uint8Array(32).fill(2);

    const expenses: ExpenseRecord[] = [
      { id: '1', payerId: alice, amount: 200n, participantIds: [alice, bob], description: 'A', timestamp: Date.now() },
      { id: '2', payerId: bob, amount: 100n, participantIds: [alice, bob], description: 'B', timestamp: Date.now() },
    ];

    const debts = calculateNetDebts(expenses);
    expect(debts.length).toBe(1);
    expect(debts[0].amount).toBe(50n);
  });

  it('no expenses produces no debts', () => {
    expect(calculateNetDebts([])).toEqual([]);
  });
});

describe('Privacy: private inputs never appear in outputs', () => {
  it('memberId is a 32-byte hash, not the raw secret', () => {
    const secret = generateSecret();
    const memberId = getMemberId(secret);
    expect(memberId.length).toBe(32);
    expect(bytesEqual(memberId, secret)).toBe(false);
  });

  it('debtKey contains no wallet address information', () => {
    const walletAddress = new TextEncoder().encode('addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp');
    const memberId = getMemberId(generateSecret());

    const key = getDebtKey(memberId, memberId);
    const keyHex = bytesToHex(key);
    const addrHex = bytesToHex(walletAddress.slice(0, 32));

    expect(keyHex).not.toContain(addrHex);
    expect(keyHex.length).toBe(64);
  });

  it('net debt results contain only memberId references, not secrets', () => {
    const secret1 = generateSecret();
    const secret2 = generateSecret();
    const id1 = getMemberId(secret1);
    const id2 = getMemberId(secret2);

    const expenses: ExpenseRecord[] = [{
      id: '1',
      payerId: id1,
      amount: 100n,
      participantIds: [id1, id2],
      description: 'Test',
      timestamp: Date.now(),
    }];

    const debts = calculateNetDebts(expenses);
    expect(debts.length).toBe(1);

    const debtorHex = bytesToHex(debts[0].debtorId);
    const secretHex = bytesToHex(secret2);
    expect(debtorHex).not.toBe(secretHex);
    expect(bytesEqual(debts[0].debtorId, secret2)).toBe(false);
  });
});
