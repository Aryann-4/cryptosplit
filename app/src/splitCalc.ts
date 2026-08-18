import { bytesToHex } from './crypto.js';

export interface ExpenseRecord {
  id: string;
  payerId: Uint8Array;
  amount: bigint;
  participantIds: Uint8Array[];
  description: string;
  timestamp: number;
}

export interface NetDebtResult {
  debtorId: Uint8Array;
  creditorId: Uint8Array;
  amount: bigint;
}

function idKey(id: Uint8Array): string {
  return bytesToHex(id);
}

export function calculateNetDebts(expenses: ExpenseRecord[]): NetDebtResult[] {
  const debts = new Map<string, bigint>();

  for (const expense of expenses) {
    const payerKey = idKey(expense.payerId);
    const shareCount = BigInt(expense.participantIds.length);
    const share = expense.amount / shareCount;
    const remainder = expense.amount % shareCount;

    for (let i = 0; i < expense.participantIds.length; i++) {
      const participant = expense.participantIds[i];
      const participantKey = idKey(participant);

      if (participantKey === payerKey) continue;

      const owed = i === 0 ? share + remainder : share;
      const key = `${participantKey}:${payerKey}`;
      const reverseKey = `${payerKey}:${participantKey}`;

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

  const results: NetDebtResult[] = [];
  for (const [key, amount] of debts) {
    if (amount <= 0n) continue;
    const [debtorHex, creditorHex] = key.split(':');
    results.push({
      debtorId: hexToBytes(debtorHex),
      creditorId: hexToBytes(creditorHex),
      amount,
    });
  }

  return results;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function calculateEqualShare(total: bigint, participantCount: number): bigint {
  return total / BigInt(participantCount);
}

export function calculateCustomShares(
  total: bigint,
  shares: bigint[],
): bigint[] {
  const sum = shares.reduce((a, b) => a + b, 0n);
  if (sum !== total) {
    throw new Error(`Shares sum to ${sum}, expected ${total}`);
  }
  return shares;
}
