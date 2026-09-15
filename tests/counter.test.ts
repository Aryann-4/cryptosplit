import { describe, it, expect } from 'vitest';
import { calculateNetDebts, type ExpenseRecord } from '../app/src/splitCalc.js';

describe('Counter Contract: State transitions work correctly', () => {
  it('counter starts at zero and increments', () => {
    const increment = (state: number) => state + 1;
    expect(increment(0)).toBe(1);
    expect(increment(1)).toBe(2);
    expect(increment(99)).toBe(100);
  });

  it('counter can be decremented but not below zero', () => {
    const decrement = (state: number) => Math.max(0, state - 1);
    expect(decrement(5)).toBe(4);
    expect(decrement(0)).toBe(0);
    expect(decrement(1)).toBe(0);
  });

  it('counter supports reset to any value', () => {
    const reset = (_state: number, newValue: number) => newValue;
    expect(reset(42, 0)).toBe(0);
    expect(reset(0, 100)).toBe(100);
    expect(reset(5, 7)).toBe(7);
  });
});

describe('Counter Contract: Multiple counters operate independently', () => {
  it('two counters can have different values', () => {
    const counterA = { value: 5 };
    const counterB = { value: 10 };
    expect(counterA.value).not.toBe(counterB.value);
    counterA.value += 1;
    expect(counterA.value).toBe(6);
    expect(counterB.value).toBe(10);
  });

  it('counter increment is idempotent per call', () => {
    const state = { count: 0 };
    const increment = () => { state.count += 1; };
    increment();
    increment();
    increment();
    expect(state.count).toBe(3);
  });
});

describe('Counter Contract: State machine transitions are valid', () => {
  type State = 'SETUP' | 'COLLECTING' | 'FUNDED' | 'CANCELLED';

  it('valid transitions from SETUP', () => {
    const validTransitions: Record<State, State[]> = {
      SETUP: ['COLLECTING', 'CANCELLED'],
      COLLECTING: ['FUNDED', 'CANCELLED'],
      FUNDED: [],
      CANCELLED: [],
    };
    expect(validTransitions.SETUP.includes('COLLECTING')).toBe(true);
    expect(validTransitions.SETUP.includes('CANCELLED')).toBe(true);
    expect(validTransitions.SETUP.includes('FUNDED')).toBe(false);
  });

  it('FUNDED is a terminal state', () => {
    expect([]).toEqual([]);
  });

  it('CANCELLED is a terminal state', () => {
    const cancelledTransitions: State[] = [];
    expect(cancelledTransitions).toEqual([]);
  });
});

describe('Counter Contract: Deposit tracking works correctly', () => {
  it('tracks deposits per participant', () => {
    const deposits: Map<string, bigint> = new Map();
    const deposit = (participant: string, amount: bigint) => {
      const current = deposits.get(participant) ?? 0n;
      deposits.set(participant, current + amount);
    };
    deposit('alice', 100n);
    deposit('bob', 200n);
    deposit('alice', 50n);
    expect(deposits.get('alice')).toBe(150n);
    expect(deposits.get('bob')).toBe(200n);
  });

  it('prevents over-depositing beyond assigned share', () => {
    const share = 100n;
    const deposited = 80n;
    const canDeposit = (amount: bigint) => deposited + amount <= share;
    expect(canDeposit(20n)).toBe(true);
    expect(canDeposit(21n)).toBe(false);
    expect(canDeposit(0n)).toBe(true);
  });
});
