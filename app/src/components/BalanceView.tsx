import type { NetDebt, Member } from '../types.ts';
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
      <div className="glass text-center py-10 animate-fade-in">
        <p className="text-sm text-ash">No outstanding debts</p>
        <p className="mono-data text-[10px] mt-1 text-surface-4">Add expenses to see settlements</p>
      </div>
    );
  }

  return (
    <div className="glass p-5 animate-fade-in">
      <h3 className="label mb-4">Balances</h3>
      <div className="space-y-2">
        {netDebts.map((debt, i) => {
          const debtorLabel = getMemberLabel(debt.debtorId);
          const creditorLabel = getMemberLabel(debt.creditorId);
          const isCurrentDebtor = currentMemberId && bytesToHex(debt.debtorId) === bytesToHex(currentMemberId);
          const isCurrentCreditor = currentMemberId && bytesToHex(debt.creditorId) === bytesToHex(currentMemberId);

          return (
            <div
              key={i}
              className="glass-subtle p-3 hover:border-white/[0.1] hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-red-400">{debtorLabel.charAt(0)}</span>
                  </div>
                  <span className={`text-sm ${isCurrentDebtor ? 'text-red-400 font-medium' : 'text-ash'}`}>
                    {debtorLabel}
                  </span>
                </div>
                <span className="text-[10px] text-surface-4">owes</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isCurrentCreditor ? 'text-mint font-medium' : 'text-ash'}`}>
                    {creditorLabel}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-mint/10 border border-mint/20 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-mint">{creditorLabel.charAt(0)}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">${(Number(debt.amount) / 100).toFixed(2)}</span>
                {isCurrentDebtor && <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">You owe</span>}
                {isCurrentCreditor && <span className="text-[10px] text-mint bg-mint/10 px-2 py-0.5 rounded-full">You are owed</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
