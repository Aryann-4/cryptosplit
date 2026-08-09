import type { Group, Expense, NetDebt, Settlement } from './types.ts';
import { bytesToHex, bytesEqual } from './crypto.ts';

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
  const debts = new Map<string, bigint>();

  for (const expense of expenses) {
    const payerKey = bytesToHex(expense.payer);
    const shareCount = BigInt(expense.participants.length);
    const share = expense.amount / shareCount;
    const remainder = expense.amount % shareCount;

    for (let i = 0; i < expense.participants.length; i++) {
      const participant = expense.participants[i];
      const participantKey = bytesToHex(participant);
      if (participantKey === payerKey) continue;

      const owed = i === 0 ? share + remainder : share;
      const key = `${payerKey}:${participantKey}`;
      const reverseKey = `${participantKey}:${payerKey}`;

      const currentDebt = debts.get(key) ?? 0n;
      debts.set(key, currentDebt + owed);

      const reverseDebt = debts.get(reverseKey) ?? 0n;
      if (reverseDebt > 0n) {
        const net = reverseDebt - owed;
        if (net > 0n) {
          debts.set(reverseKey, net);
          debts.set(key, 0n);
        } else if (net < 0n) {
          debts.set(key, -net);
          debts.set(reverseKey, 0n);
        } else {
          debts.set(key, 0n);
          debts.set(reverseKey, 0n);
        }
      }
    }
  }

  const results: NetDebt[] = [];
  for (const [key, amount] of debts) {
    if (amount <= 0n) continue;
    const [debtorHex, creditorHex] = key.split(':');
    results.push({
      debtorId: hexToBytes(debtorHex),
      creditorId: hexToBytes(creditorHex),
      amount,
    });
  }

  state.netDebts.set(contractAddress, results);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
