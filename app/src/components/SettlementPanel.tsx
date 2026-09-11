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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Settlement</span>
        </h3>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">All clear!</p>
          <p className="text-sm text-gray-400 mt-1">You have no outstanding debts</p>
        </div>
      </div>
    );
  }

  const totalOwed = myDebts.reduce((sum, d) => sum + d.amount, 0n);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>Settlement</span>
      </h3>

      {/* Total Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Total owed</p>
            <p className="text-3xl font-bold text-red-700">{formatAmount(totalOwed)}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-red-500 mt-2">
          {myDebts.length} debt{myDebts.length !== 1 ? 's' : ''} to settle
        </p>
      </div>

      {/* Debt List */}
      <div className="space-y-3 mb-4">
        {myDebts.map((debt, i) => (
          <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-midnight-100 rounded-full flex items-center justify-center">
                  <span className="text-midnight-600 text-sm font-bold">
                    {getMemberLabel(debt.creditorId).charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getMemberLabel(debt.creditorId)}</p>
                  <p className="text-sm text-gray-500">{formatAmount(debt.amount)}</p>
                </div>
              </div>
              <button
                onClick={() => onSettle(debt.creditorId, debt.amount)}
                disabled={settling}
                className="bg-midnight-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-midnight-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
              >
                {settling ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Paying...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Pay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Settle All Button */}
      <button
        onClick={() => {
          myDebts.forEach((debt) => onSettle(debt.creditorId, debt.amount));
        }}
        disabled={settling || myDebts.length === 0}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center space-x-2"
      >
        {settling ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Settling All...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Settle All ({myDebts.length} debts)</span>
          </>
        )}
      </button>
    </div>
  );
}
