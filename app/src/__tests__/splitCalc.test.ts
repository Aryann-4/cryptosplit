import { describe, it, expect, beforeEach } from 'vitest';
import { calculateNetDebts, calculateEqualShare, calculateCustomShares } from '../splitCalc.js';
import { bytesToHex } from '../crypto.js';

describe('calculateEqualShare', () => {
  it('splits evenly with no remainder', () => {
    expect(calculateEqualShare(300n, 3)).toBe(100n);
  });

  it('handles remainder', () => {
    expect(calculateEqualShare(100n, 3)).toBe(33n);
  });

  it('handles single participant', () => {
    expect(calculateEqualShare(500n, 1)).toBe(500n);
  });
});

describe('calculateCustomShares', () => {
  it('validates shares sum to total', () => {
    expect(() => calculateCustomShares(100n, [30n, 30n, 30n])).toThrow();
  });

  it('accepts valid shares', () => {
    const result = calculateCustomShares(100n, [50n, 30n, 20n]);
    expect(result).toEqual([50n, 30n, 20n]);
  });
});

describe('calculateNetDebts', () => {
  it('calculates simple debt from one expense', () => {
    const alice = new Uint8Array(32).fill(1);
    const bob = new Uint8Array(32).fill(2);
    const charlie = new Uint8Array(32).fill(3);

    const expenses = [
      {
        id: '1',
        payerId: alice,
        amount: 300n,
        participantIds: [alice, bob, charlie],
        description: 'Dinner',
        timestamp: Date.now(),
      },
    ];

    const debts = calculateNetDebts(expenses);
    expect(debts.length).toBe(2);

    const aliceHex = bytesToHex(alice);
    const bobHex = bytesToHex(bob);
    const charlieHex = bytesToHex(charlie);

    const bobDebt = debts.find(
      (d) => bytesToHex(d.debtorId) === bobHex && bytesToHex(d.creditorId) === aliceHex,
    );
    expect(bobDebt?.amount).toBe(100n);

    const charlieDebt = debts.find(
      (d) => bytesToHex(d.debtorId) === charlieHex && bytesToHex(d.creditorId) === aliceHex,
    );
    expect(charlieDebt?.amount).toBe(100n);
  });

  it('nets out mutual debts', () => {
    const alice = new Uint8Array(32).fill(1);
    const bob = new Uint8Array(32).fill(2);

    const expenses = [
      {
        id: '1',
        payerId: alice,
        amount: 200n,
        participantIds: [alice, bob],
        description: 'Expense 1',
        timestamp: Date.now(),
      },
      {
        id: '2',
        payerId: bob,
        amount: 100n,
        participantIds: [alice, bob],
        description: 'Expense 2',
        timestamp: Date.now(),
      },
    ];

    const debts = calculateNetDebts(expenses);
    const aliceHex = bytesToHex(alice);
    const bobHex = bytesToHex(bob);

    // Alice paid 200, Bob paid 100. Split 2 ways.
    // Alice owes Bob: 50, Bob owes Alice: 100
    // Net: Bob owes Alice 50
    expect(debts.length).toBe(1);
    expect(bytesToHex(debts[0].debtorId)).toBe(bobHex);
    expect(bytesToHex(debts[0].creditorId)).toBe(aliceHex);
    expect(debts[0].amount).toBe(50n);
  });

  it('returns empty array for no expenses', () => {
    const debts = calculateNetDebts([]);
    expect(debts).toEqual([]);
  });

  it('handles single participant (no debt)', () => {
    const alice = new Uint8Array(32).fill(1);

    const expenses = [
      {
        id: '1',
        payerId: alice,
        amount: 100n,
        participantIds: [alice],
        description: 'Solo expense',
        timestamp: Date.now(),
      },
    ];

    const debts = calculateNetDebts(expenses);
    expect(debts).toEqual([]);
  });

  it('handles three-way mutual debts', () => {
    const alice = new Uint8Array(32).fill(1);
    const bob = new Uint8Array(32).fill(2);
    const charlie = new Uint8Array(32).fill(3);

    const expenses = [
      {
        id: '1',
        payerId: alice,
        amount: 60n,
        participantIds: [alice, bob, charlie],
        description: 'Expense A',
        timestamp: Date.now(),
      },
      {
        id: '2',
        payerId: bob,
        amount: 60n,
        participantIds: [alice, bob, charlie],
        description: 'Expense B',
        timestamp: Date.now(),
      },
      {
        id: '3',
        payerId: charlie,
        amount: 60n,
        participantIds: [alice, bob, charlie],
        description: 'Expense C',
        timestamp: Date.now(),
      },
    ];

    const debts = calculateNetDebts(expenses);
    // Everyone paid 60, everyone owes 40 of each other's expense
    // Net: all debts cancel out
    expect(debts.length).toBe(0);
  });
});
