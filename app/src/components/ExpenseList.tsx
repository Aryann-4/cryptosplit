import type { Expense, Member } from '../types.ts';
import { getMemberLabel } from '../store.ts';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
}

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ExpenseList({ expenses, members }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="glass p-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-surface-500 text-sm">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.slice().reverse().map((expense) => {
        const payerLabel = getMemberLabel(expense.payer);
        const participantCount = expense.participants.length;
        const perPerson = Number(expense.amount) / participantCount / 100;

        return (
          <div key={expense.id} className="glass p-4 hover:border-white/[0.1] transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-400">{payerLabel.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{expense.description || 'Untitled'}</p>
                  <p className="text-xs text-surface-500">Paid by {payerLabel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">${(Number(expense.amount) / 100).toFixed(2)}</p>
                <p className="text-[10px] text-surface-600">{timeAgo(expense.timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-12">
              <span className="text-[10px] text-surface-600">Split:</span>
              <div className="flex -space-x-1">
                {expense.participants.slice(0, 4).map((pid, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center"
                    title={getMemberLabel(pid)}
                  >
                    <span className="text-[8px] text-surface-400">{getMemberLabel(pid).charAt(0)}</span>
                  </div>
                ))}
                {expense.participants.length > 4 && (
                  <div className="w-5 h-5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-[8px] text-surface-500">+{expense.participants.length - 4}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-surface-600">${perPerson.toFixed(2)} each</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
