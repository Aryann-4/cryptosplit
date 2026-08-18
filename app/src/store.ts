import type { Group, Expense, NetDebt, Settlement } from './types.ts';
import { bytesToHex } from './crypto.ts';
import { calculateNetDebts, type ExpenseRecord } from './splitCalc.ts';

interface GroupState {
  groups: Map<string, Group>;
  expenses: Map<string, Expense[]>;
  netDebts: Map<string, NetDebt[]>;
}

const state: GroupState = {
  groups: new Map(),
  expenses: new Map(),
  netDebts: new Map(),
};

export function createGroup(group: Group): void {
  state.groups.set(group.contractAddress, group);
  state.expenses.set(group.contractAddress, []);
  state.netDebts.set(group.contractAddress, []);
}

export function addExpense(contractAddress: string, expense: Expense): void {
  const groupExpenses = state.expenses.get(contractAddress) ?? [];
  groupExpenses.push(expense);
  state.expenses.set(contractAddress, groupExpenses);
  recalculateNetDebts(contractAddress);
}

export function getGroup(contractAddress: string): Group | undefined {
  return state.groups.get(contractAddress);
}

export function getExpenses(contractAddress: string): Expense[] {
  return state.expenses.get(contractAddress) ?? [];
}

export function getNetDebts(contractAddress: string): NetDebt[] {
  return state.netDebts.get(contractAddress) ?? [];
}

export function getAllGroups(): Group[] {
  return Array.from(state.groups.values());
}

function recalculateNetDebts(contractAddress: string): void {
  const expenses = state.expenses.get(contractAddress) ?? [];
  const records: ExpenseRecord[] = expenses.map((e) => ({
    id: e.id,
    payerId: e.payer,
    amount: e.amount,
    participantIds: e.participants,
    description: e.description,
    timestamp: e.timestamp,
  }));
  const results = calculateNetDebts(records);
  state.netDebts.set(
    contractAddress,
    results.map((r) => ({
      debtorId: r.debtorId,
      creditorId: r.creditorId,
      amount: r.amount,
    })),
  );
}
