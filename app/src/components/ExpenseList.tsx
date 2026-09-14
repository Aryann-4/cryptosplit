import type { Expense, Member } from '../types.ts';
import { getMemberLabel } from '../store.ts';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
}

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return `${Math.floor(diff / 86400000)}d`;
}

export default function ExpenseList({ expenses, members }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-xs text-ash">No expenses yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {expenses.slice().reverse().map((expense) => {
        const payerLabel = getMemberLabel(expense.payer);
        const perPerson = Number(expense.amount) / expense.participants.length / 100;

        return (
          <div key={expense.id} className="card flex items-center justify-between hover:border-shell-5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-action/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-action">{payerLabel.charAt(0)}</span>
              </div>
              <div>
                <p className="text-xs text-cloud font-medium">{expense.description || 'Untitled'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="mono-data text-[10px]">by {payerLabel}</span>
                  <span className="text-shell-4">·</span>
                  <span className="mono-data text-[10px]">{expense.participants.length} split</span>
                  <span className="text-shell-4">·</span>
                  <span className="mono-data text-[10px]">{timeAgo(expense.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p className="text-sm font-medium text-cloud">${(Number(expense.amount) / 100).toFixed(2)}</p>
              <p className="mono-data text-[10px]">${perPerson.toFixed(2)}/ea</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
