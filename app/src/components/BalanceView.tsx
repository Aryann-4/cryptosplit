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

  if (filteredDebts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Balances</h3>
        <p className="text-gray-500 text-center py-4">No outstanding debts. All settled!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Balances</h3>
      <div className="space-y-3">
        {filteredDebts.map((debt, i) => {
          const isCurrentUser =
            currentMemberId &&
            bytesToHex(debt.debtorId) === bytesToHex(currentMemberId);

          return (
            <div
              key={i}
              className={`border rounded-lg p-4 ${
                isCurrentUser ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    {getMemberLabel(debt.debtorId)} owes{' '}
                    {getMemberLabel(debt.creditorId)}
                  </p>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    isCurrentUser ? 'text-red-700' : 'text-green-700'
                  }`}
                >
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
