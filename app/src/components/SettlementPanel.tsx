import type { NetDebt, Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface SettlementPanelProps {
  netDebts: NetDebt[];
  members: Member[];
  currentMemberId?: Uint8Array;
  onSettle: (creditorId: Uint8Array, amount: bigint) => void;
  settling: boolean;
}

export default function SettlementPanel({
  netDebts,
  members,
  currentMemberId,
  onSettle,
  settling,
}: SettlementPanelProps) {
  const getMemberLabel = (memberId: Uint8Array): string => {
    const member = members.find((m) => bytesToHex(m.memberId) === bytesToHex(memberId));
    return member?.label ?? 'Unknown';
  };

  const formatAmount = (amount: bigint): string => {
    return `$${(Number(amount) / 100).toFixed(2)}`;
  };

  const myDebts = currentMemberId
    ? netDebts.filter((d) => bytesToHex(d.debtorId) === bytesToHex(currentMemberId))
    : [];

  if (myDebts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement</h3>
        <p className="text-gray-500 text-center py-4">You have no outstanding debts!</p>
      </div>
    );
  }

  const totalOwed = myDebts.reduce((sum, d) => sum + d.amount, 0n);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settlement</h3>

      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">Total owed</p>
        <p className="text-2xl font-bold text-red-700">{formatAmount(totalOwed)}</p>
      </div>

      <div className="space-y-3 mb-4">
        {myDebts.map((debt, i) => (
          <div key={i} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
            <div>
              <p className="font-medium text-gray-900">To {getMemberLabel(debt.creditorId)}</p>
              <p className="text-sm text-gray-500">{formatAmount(debt.amount)}</p>
            </div>
            <button
              onClick={() => onSettle(debt.creditorId, debt.amount)}
              disabled={settling}
              className="bg-midnight-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-midnight-700 disabled:opacity-50"
            >
              {settling ? 'Paying...' : 'Pay'}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          myDebts.forEach((debt) => onSettle(debt.creditorId, debt.amount));
        }}
        disabled={settling || myDebts.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {settling ? 'Settling All...' : `Settle All (${myDebts.length} debts)`}
      </button>
    </div>
  );
}
