import type { NetDebt } from '../types.ts';
import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';
import { getMemberLabel } from '../store.ts';

interface BalanceViewProps {
  netDebts: NetDebt[];
  members: Member[];
  currentMemberId?: Uint8Array;
}

export default function BalanceView({ netDebts, members, currentMemberId }: BalanceViewProps) {
  if (netDebts.length === 0) {
    return (
      <div className="glass p-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <p className="text-surface-500 text-sm">No outstanding balances</p>
      </div>
    );
  }

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span>Balances</span>
      </h3>
      <div className="space-y-2">
        {netDebts.map((debt, i) => {
          const debtorLabel = getMemberLabel(debt.debtorId);
          const creditorLabel = getMemberLabel(debt.creditorId);
          const isCurrentDebtor = currentMemberId && bytesToHex(debt.debtorId) === bytesToHex(currentMemberId);
          const isCurrentCreditor = currentMemberId && bytesToHex(debt.creditorId) === bytesToHex(currentMemberId);

          return (
            <div
              key={i}
              className={`p-3 rounded-xl border transition-all ${
                isCurrentDebtor || isCurrentCreditor
                  ? 'bg-white/[0.04] border-white/[0.08]'
                  : 'bg-white/[0.02] border-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-red-400">{debtorLabel.charAt(0)}</span>
                  </div>
                  <span className={`text-sm ${isCurrentDebtor ? 'text-red-400 font-medium' : 'text-surface-300'}`}>
                    {debtorLabel}
                  </span>
                </div>
                <span className="text-xs text-surface-600">owes</span>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-emerald-400">{creditorLabel.charAt(0)}</span>
                  </div>
                  <span className={`text-sm ${isCurrentCreditor ? 'text-emerald-400 font-medium' : 'text-surface-300'}`}>
                    {creditorLabel}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">${(Number(debt.amount) / 100).toFixed(2)}</span>
                {isCurrentDebtor && (
                  <span className="text-[10px] text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded-full">You owe</span>
                )}
                {isCurrentCreditor && (
                  <span className="text-[10px] text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full">You are owed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
