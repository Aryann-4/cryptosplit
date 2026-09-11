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

  const formatAmount = (amount: bigint): string => `$${(Number(amount) / 100).toFixed(2)}`;

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (expenses.length === 0) {
    return (
      <div className="glass p-6">
        <h3 className="text-lg font-semibold gradient-text mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Expenses</span>
        </h3>
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="text-surface-300 font-medium">No expenses yet</p>
          <p className="text-sm text-surface-500 mt-1">Add your first expense to get started!</p>
        </div>
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0n);

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Expenses</span>
        </h3>
        <span className="text-sm text-surface-500">
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''} · {formatAmount(total)}
        </span>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02] hover:border-white/[0.1] transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-surface-200 group-hover:text-white transition-colors">
                  {expense.description || 'Untitled expense'}
                </p>
                <div className="flex items-center space-x-3 text-sm text-surface-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Paid by {getMemberLabel(expense.payer)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(expense.timestamp)}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-surface-200 group-hover:text-white transition-colors">
                  {formatAmount(expense.amount)}
                </p>
                <p className="text-xs text-surface-600">
                  ${expense.participants.length > 0 ? (Number(expense.amount) / expense.participants.length / 100).toFixed(2) : '0.00'} / person
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {expense.participants.map((p) => (
                <span key={bytesToHex(p)} className="inline-flex items-center space-x-1 bg-white/[0.05] text-surface-400 text-xs px-2 py-1 rounded-full border border-white/[0.06]">
                  <div className="w-4 h-4 rounded-full bg-[#4c6ef5]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#4c6ef5] text-[10px] font-bold">{getMemberLabel(p).charAt(0)}</span>
                  </div>
                  <span>{getMemberLabel(p)}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
