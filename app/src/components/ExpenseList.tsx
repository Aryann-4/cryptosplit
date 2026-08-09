import type { Expense, Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
}

export default function ExpenseList({ expenses, members }: ExpenseListProps) {
  const getMemberLabel = (memberId: Uint8Array): string => {
    const member = members.find((m) => bytesToHex(m.memberId) === bytesToHex(memberId));
    return member?.label ?? 'Unknown';
  };

  const formatAmount = (amount: bigint): string => {
    return `$${(Number(amount) / 100).toFixed(2)}`;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
        <p className="text-gray-500 text-center py-4">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">
                  {expense.description || 'Untitled expense'}
                </p>
                <p className="text-sm text-gray-500">
                  Paid by {getMemberLabel(expense.payer)}
                </p>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatAmount(expense.amount)}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {expense.participants.map((p) => (
                <span
                  key={bytesToHex(p)}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {getMemberLabel(p)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
