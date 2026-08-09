import { useState, useCallback } from 'react';
import type { Group, Expense, NetDebt } from '../types.ts';
import { calculateNetDebts, type ExpenseRecord } from '../splitCalc.ts';
import { bytesToHex } from '../crypto.ts';

interface GroupState {
  groups: Map<string, Group>;
  expenses: Map<string, Expense[]>;
  netDebts: Map<string, NetDebt[]>;
}

export function useGroup() {
  const [state, setState] = useState<GroupState>({
    groups: new Map(),
    expenses: new Map(),
    netDebts: new Map(),
  });

  const createGroup = useCallback((group: Group) => {
    setState((s) => {
      const groups = new Map(s.groups);
      groups.set(group.contractAddress, group);
      const expenses = new Map(s.expenses);
      expenses.set(group.contractAddress, []);
      const netDebts = new Map(s.netDebts);
      netDebts.set(group.contractAddress, []);
      return { groups, expenses, netDebts };
    });
  }, []);

  const addExpense = useCallback((contractAddress: string, expense: Expense) => {
    setState((s) => {
      const expenses = new Map(s.expenses);
      const groupExpenses = expenses.get(contractAddress) ?? [];
      expenses.set(contractAddress, [...groupExpenses, expense]);

      const allExpenses = expenses.get(contractAddress) ?? [];
      const expenseRecords: ExpenseRecord[] = allExpenses.map((e) => ({
        id: e.id,
        payerId: e.payer,
        amount: e.amount,
        participantIds: e.participants,
        description: e.description,
        timestamp: e.timestamp,
      }));
      const netDebtResults = calculateNetDebts(expenseRecords);

      const netDebts = new Map(s.netDebts);
      netDebts.set(
        contractAddress,
        netDebtResults.map((r) => ({
          debtorId: r.debtorId,
          creditorId: r.creditorId,
          amount: r.amount,
        })),
      );

      return { groups: s.groups, expenses, netDebts };
    });
  }, []);

  const getGroup = useCallback(
    (contractAddress: string): Group | undefined => {
      return state.groups.get(contractAddress);
    },
    [state.groups],
  );

  const getExpenses = useCallback(
    (contractAddress: string): Expense[] => {
      return state.expenses.get(contractAddress) ?? [];
    },
    [state.expenses],
  );

  const getNetDebts = useCallback(
    (contractAddress: string): NetDebt[] => {
      return state.netDebts.get(contractAddress) ?? [];
    },
    [state.netDebts],
  );

  return {
    groups: Array.from(state.groups.values()),
    createGroup,
    addExpense,
    getGroup,
    getExpenses,
    getNetDebts,
  };
}
