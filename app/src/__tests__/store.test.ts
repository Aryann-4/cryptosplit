import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGroup,
  addExpense,
  getGroup,
  getExpenses,
  getNetDebts,
  getAllGroups,
} from '../store.js';
import { generateSecret, bytesToHex, bytesEqual } from '../crypto.js';
import type { Group, Expense, Member } from '../types.js';

function makeMember(label: string): Member {
  return {
    memberId: generateSecret(),
    label,
    isActive: true,
  };
}

function makeGroup(members: Member[]): Group {
  return {
    contractAddress: bytesToHex(generateSecret()),
    organizer: generateSecret(),
    tokenColor: new Uint8Array(32),
    members,
    createdAt: Date.now(),
  };
}

describe('createGroup', () => {
  it('creates a group and makes it retrievable', () => {
    const alice = makeMember('Alice');
    const bob = makeMember('Bob');
    const group = makeGroup([alice, bob]);

    createGroup(group);

    const found = getGroup(group.contractAddress);
    expect(found).toBeDefined();
    expect(found?.members.length).toBe(2);
  });

  it('initializes empty expenses and debts', () => {
    const group = makeGroup([makeMember('Alice')]);
    createGroup(group);

    expect(getExpenses(group.contractAddress)).toEqual([]);
    expect(getNetDebts(group.contractAddress)).toEqual([]);
  });
});

describe('addExpense', () => {
  let group: Group;
  let alice: Member;
  let bob: Member;
  let charlie: Member;

  beforeEach(() => {
    alice = makeMember('Alice');
    bob = makeMember('Bob');
    charlie = makeMember('Charlie');
    group = makeGroup([alice, bob, charlie]);
    createGroup(group);
  });

  it('adds an expense to the group', () => {
    const expense: Expense = {
      id: 'exp1',
      groupId: group.contractAddress,
      payer: alice.memberId,
      amount: 300n,
      participants: [alice.memberId, bob.memberId, charlie.memberId],
      splitType: 'equal',
      description: 'Dinner',
      timestamp: Date.now(),
    };

    addExpense(group.contractAddress, expense);

    const expenses = getExpenses(group.contractAddress);
    expect(expenses.length).toBe(1);
    expect(expenses[0].amount).toBe(300n);
  });

  it('calculates net debts after adding expense', () => {
    const expense: Expense = {
      id: 'exp1',
      groupId: group.contractAddress,
      payer: alice.memberId,
      amount: 300n,
      participants: [alice.memberId, bob.memberId, charlie.memberId],
      splitType: 'equal',
      description: 'Dinner',
      timestamp: Date.now(),
    };

    addExpense(group.contractAddress, expense);

    const debts = getNetDebts(group.contractAddress);
    expect(debts.length).toBe(2);

    const aliceHex = bytesToHex(alice.memberId);
    const bobHex = bytesToHex(bob.memberId);
    const charlieHex = bytesToHex(charlie.memberId);

    const bobDebt = debts.find(
      (d) => bytesToHex(d.debtorId) === bobHex && bytesToHex(d.creditorId) === aliceHex,
    );
    expect(bobDebt?.amount).toBe(100n);

    const charlieDebt = debts.find(
      (d) => bytesToHex(d.debtorId) === charlieHex && bytesToHex(d.creditorId) === aliceHex,
    );
    expect(charlieDebt?.amount).toBe(100n);
  });

  it('nets out mutual debts across multiple expenses', () => {
    addExpense(group.contractAddress, {
      id: 'exp1',
      groupId: group.contractAddress,
      payer: alice.memberId,
      amount: 200n,
      participants: [alice.memberId, bob.memberId],
      splitType: 'equal',
      description: 'Lunch',
      timestamp: Date.now(),
    });

    addExpense(group.contractAddress, {
      id: 'exp2',
      groupId: group.contractAddress,
      payer: bob.memberId,
      amount: 100n,
      participants: [alice.memberId, bob.memberId],
      splitType: 'equal',
      description: 'Coffee',
      timestamp: Date.now(),
    });

    const debts = getNetDebts(group.contractAddress);
    const aliceHex = bytesToHex(alice.memberId);
    const bobHex = bytesToHex(bob.memberId);

    // Alice paid 200, Bob paid 100, split 2 ways each
    // Alice owes Bob: 50, Bob owes Alice: 100
    // Net: Bob owes Alice 50
    expect(debts.length).toBe(1);
    expect(bytesToHex(debts[0].debtorId)).toBe(bobHex);
    expect(bytesToHex(debts[0].creditorId)).toBe(aliceHex);
    expect(debts[0].amount).toBe(50n);
  });
});

describe('getAllGroups', () => {
  it('returns all created groups', () => {
    const g1 = makeGroup([makeMember('A')]);
    const g2 = makeGroup([makeMember('B')]);

    createGroup(g1);
    createGroup(g2);

    const all = getAllGroups();
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
