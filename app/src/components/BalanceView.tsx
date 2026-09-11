import type { NetDebt, Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface BalanceViewProps {
  netDebts: NetDebt[];
  members: Member[];
  currentMemberId?: Uint8Array;
}

export default function BalanceView({ netDebts, members, currentMemberId }: BalanceViewProps) {
  const getMemberLabel = (memberId: Uint8Array): string => {
    const member = members.find((m) => bytesToHex(m.memberId) === bytesToHex(memberId));
    return member?.label ?? 'Unknown';
  };

  const formatAmount = (amount: bigint): string => {
    return `$${(Number(amount) / 100).toFixed(2)}`;
  };

  const filteredDebts = currentMemberId
    ? netDebts.filter(
        (d) =>
          bytesToHex(d.debtorId) === bytesToHex(currentMemberId) ||
          bytesToHex(d.creditorId) === bytesToHex(currentMemberId),
      )
    : netDebts;

  const maxDebt = filteredDebts.length > 0
    ? filteredDebts.reduce((max, d) => d.amount > max ? d.amount : max, filteredDebts[0].amount)
    : 0n;

  const totalOwed = currentMemberId
    ? netDebts
        .filter((d) => bytesToHex(d.debtorId) === bytesToHex(currentMemberId))
        .reduce((sum, d) => sum + d.amount, 0n)
    : 0n;

  const totalOwedToMe = currentMemberId
    ? netDebts
        .filter((d) => bytesToHex(d.creditorId) === bytesToHex(currentMemberId))
        .reduce((sum, d) => sum + d.amount, 0n)
    : 0n;

  if (filteredDebts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Balances</span>
        </h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">All settled up!</p>
          <p className="text-sm text-gray-400 mt-1">No outstanding debts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Balances</span>
      </h3>

      {currentMemberId && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg ${totalOwed > 0n ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
            <p className="text-xs text-gray-500 mb-0.5">You owe</p>
            <p className={`text-lg font-bold ${totalOwed > 0n ? 'text-red-600' : 'text-gray-400'}`}>
              {formatAmount(totalOwed)}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${totalOwedToMe > 0n ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-100'}`}>
            <p className="text-xs text-gray-500 mb-0.5">Owed to you</p>
            <p className={`text-lg font-bold ${totalOwedToMe > 0n ? 'text-green-600' : 'text-gray-400'}`}>
              {formatAmount(totalOwedToMe)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredDebts.map((debt, i) => {
          const isCurrentUser =
            currentMemberId &&
            bytesToHex(debt.debtorId) === bytesToHex(currentMemberId);

          const percentage = maxDebt > 0n ? Number((debt.amount * 100n) / maxDebt) : 0;

          return (
            <div
              key={i}
              className={`border rounded-xl p-4 transition-all ${
                isCurrentUser ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isCurrentUser ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {getMemberLabel(debt.debtorId).charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getMemberLabel(debt.debtorId)}
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div className="w-6 h-6 rounded-full bg-midnight-500 flex items-center justify-center text-white text-xs font-bold">
                    {getMemberLabel(debt.creditorId).charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getMemberLabel(debt.creditorId)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mx-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCurrentUser ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
                <p className={`text-lg font-bold ${
                  isCurrentUser ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatAmount(debt.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
