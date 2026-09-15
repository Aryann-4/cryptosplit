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
      <div className="glass text-center py-10 animate-fade-in">
        <p className="text-sm text-ash">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.slice().reverse().map((expense, i) => {
        const payerLabel = getMemberLabel(expense.payer);
        const perPerson = Number(expense.amount) / expense.participants.length / 100;

        return (
          <div
            key={expense.id}
            className="glass p-4 hover:border-white/[0.12] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-blue/20 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.2)] transition-shadow duration-300">
                  <span className="text-sm font-medium text-accent">{payerLabel.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{expense.description || 'Untitled'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="mono-data text-[10px]">by {payerLabel}</span>
                    <span className="text-surface-4">·</span>
                    <span className="mono-data text-[10px]">{expense.participants.length} split</span>
                    <span className="text-surface-4">·</span>
                    <span className="mono-data text-[10px]">{timeAgo(expense.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-lg font-bold text-white">${(Number(expense.amount) / 100).toFixed(2)}</p>
                <p className="mono-data text-[10px]">${perPerson.toFixed(2)}/ea</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
