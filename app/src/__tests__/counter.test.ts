import { describe, it, expect } from 'vitest';

type BillStatus = 'SETUP' | 'COLLECTING' | 'FUNDED' | 'SETTLED' | 'CANCELLED';

interface BillState {
  status: BillStatus;
  totalAmount: bigint;
  totalOwed: bigint;
  totalDeposited: bigint;
  participantCount: number;
  owed: Map<string, bigint>;
  deposited: Map<string, bigint>;
}

function createBill(total: bigint): BillState {
  return {
    status: 'SETUP',
    totalAmount: total,
    totalOwed: 0n,
    totalDeposited: 0n,
    participantCount: 0,
    owed: new Map(),
    deposited: new Map(),
  };
}

function addParticipant(state: BillState, pid: string, share: bigint): BillState {
  if (state.status !== 'SETUP') throw new Error('bill is no longer accepting participants');
  if (state.owed.has(pid)) throw new Error('participant already registered');
  return {
    ...state,
    owed: new Map(state.owed).set(pid, share),
    deposited: new Map(state.deposited).set(pid, 0n),
    totalOwed: state.totalOwed + share,
    participantCount: state.participantCount + 1,
  };
}

function finalizeSetup(state: BillState): BillState {
  if (state.status !== 'SETUP') throw new Error('bill has already been finalized');
  if (state.totalOwed !== state.totalAmount) throw new Error('shares must add up to total');
  return { ...state, status: 'COLLECTING' };
}

function deposit(state: BillState, pid: string, amount: bigint): BillState {
  if (state.status !== 'COLLECTING') throw new Error('bill is not collecting');
  const owedShare = state.owed.get(pid);
  if (owedShare === undefined) throw new Error('unknown participant');
  const paid = state.deposited.get(pid) ?? 0n;
  if (paid + amount > owedShare) throw new Error('deposit exceeds share');
  const newDeposited = new Map(state.deposited).set(pid, paid + amount);
  const newTotal = state.totalDeposited + amount;
  return {
    ...state,
    deposited: newDeposited,
    totalDeposited: newTotal,
    status: newTotal === state.totalAmount ? 'FUNDED' : state.status,
  };
}

function settle(state: BillState): BillState {
  if (state.status !== 'FUNDED') throw new Error('bill not fully funded');
  return { ...state, status: 'SETTLED' };
}

function cancel(state: BillState): BillState {
  if (state.status !== 'SETUP' && state.status !== 'COLLECTING') {
    throw new Error('only unsettled bill can be cancelled');
  }
  return { ...state, status: 'CANCELLED' };
}

describe('Counter Contract: State transitions', () => {
  it('bill starts in SETUP status', () => {
    const bill = createBill(300n);
    expect(bill.status).toBe('SETUP');
    expect(bill.totalAmount).toBe(300n);
  });

  it('advances from SETUP to COLLECTING via finalizeSetup', () => {
    let bill = createBill(200n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = addParticipant(bill, 'bob', 100n);
    bill = finalizeSetup(bill);
    expect(bill.status).toBe('COLLECTING');
  });

  it('advances from COLLECTING to FUNDED when fully deposited', () => {
    let bill = createBill(200n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = addParticipant(bill, 'bob', 100n);
    bill = finalizeSetup(bill);
    bill = deposit(bill, 'alice', 100n);
    bill = deposit(bill, 'bob', 100n);
    expect(bill.status).toBe('FUNDED');
  });

  it('advances from FUNDED to SETTLED via settle', () => {
    let bill = createBill(200n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = addParticipant(bill, 'bob', 100n);
    bill = finalizeSetup(bill);
    bill = deposit(bill, 'alice', 100n);
    bill = deposit(bill, 'bob', 100n);
    bill = settle(bill);
    expect(bill.status).toBe('SETTLED');
  });

  it('can cancel from SETUP', () => {
    let bill = createBill(100n);
    bill = cancel(bill);
    expect(bill.status).toBe('CANCELLED');
  });

  it('can cancel from COLLECTING', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    bill = cancel(bill);
    expect(bill.status).toBe('CANCELLED');
  });
});

describe('Counter Contract: Cannot transition from terminal states', () => {
  it('cannot deposit after SETTLED', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    bill = deposit(bill, 'alice', 100n);
    bill = settle(bill);
    expect(() => deposit(bill, 'alice', 10n)).toThrow();
  });

  it('cannot settle from COLLECTING', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    expect(() => settle(bill)).toThrow();
  });

  it('cannot finalize after COLLECTING', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    expect(() => finalizeSetup(bill)).toThrow();
  });
});

describe('Counter Contract: Deposit tracking', () => {
  it('tracks partial deposits per participant', () => {
    let bill = createBill(200n);
    bill = addParticipant(bill, 'alice', 200n);
    bill = finalizeSetup(bill);
    bill = deposit(bill, 'alice', 50n);
    expect(bill.deposited.get('alice')).toBe(50n);
    bill = deposit(bill, 'alice', 50n);
    expect(bill.deposited.get('alice')).toBe(100n);
    expect(bill.totalDeposited).toBe(100n);
  });

  it('prevents deposit exceeding assigned share', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    bill = deposit(bill, 'alice', 80n);
    expect(() => deposit(bill, 'alice', 30n)).toThrow();
  });

  it('rejects deposits from unknown participants', () => {
    let bill = createBill(100n);
    bill = addParticipant(bill, 'alice', 100n);
    bill = finalizeSetup(bill);
    expect(() => deposit(bill, 'unknown', 50n)).toThrow();
  });
});
